<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\GameSession;
use App\Models\InventoryItem;

class GeminiService
{
    protected $apiKey;
    protected $model;
    protected $baseUrl  = 'https://generativelanguage.googleapis.com/v1beta';

    // Daily request limit — matches Gemini free tier RPD
    // const DAILY_LIMIT     = 20; // DISABLED: Request limit removed
    const DAILY_LIMIT     = 999999; // Set to very high number to effectively disable
    const CACHE_KEY       = 'gemini_daily_requests';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->model  = config('services.gemini.model', 'gemini-2.5-flash-lite');
    }

    /**
     * Get the number of requests made today.
     */
    public function getRequestsToday(): int
    {
        return (int) Cache::get(self::CACHE_KEY, 0);
    }

    /**
     * Get how many requests are remaining today.
     */
    public function getRemainingRequests(): int
    {
        // DISABLED: Always return high number to indicate no limit
        return 999999;
        // return max(0, self::DAILY_LIMIT - $this->getRequestsToday());
    }

    /**
     * Check if the daily limit has been reached.
     */
    public function isLimitReached(): bool
    {
        // DISABLED: Never return true to remove limit
        return false;
        // return $this->getRequestsToday() >= self::DAILY_LIMIT;
    }

    /**
     * Increment the daily request counter.
     * Automatically resets at midnight (stores until end of day).
     */
    public function incrementRequestCount(): void
    {
        $secondsUntilMidnight = now()->secondsUntilEndOfDay();

        if (Cache::has(self::CACHE_KEY)) {
            Cache::increment(self::CACHE_KEY);
        } else {
            // First request of the day — set with TTL until midnight
            Cache::put(self::CACHE_KEY, 1, $secondsUntilMidnight);
        }

        Log::info('LoreForge: Gemini request count', [
            'requests_today' => $this->getRequestsToday(),
            'limit'          => self::DAILY_LIMIT,
            'remaining'      => $this->getRemainingRequests(),
        ]);
    }

    /**
     * Seed starter inventory items for a new game session.
     * Called once when a session is first created.
     */
    public function giveStarterItems(GameSession $session): void
    {
        $starterItems = [
            ['item_name' => 'Healing Potion', 'description' => 'Restores +25 HP when used.'],
            ['item_name' => 'Healing Potion', 'description' => 'Restores +25 HP when used.'],
            ['item_name' => 'Mana Potion',    'description' => 'Restores +20 MP when used.'],
            ['item_name' => 'Mana Potion',    'description' => 'Restores +20 MP when used.'],
        ];

        foreach ($starterItems as $item) {
            InventoryItem::create([
                'session_id'  => $session->id,
                'item_name'   => $item['item_name'],
                'description' => $item['description'],
                'acquired_at' => 0,
                'removed_at'  => null,
            ]);
        }

        Log::info('LoreForge: Starter items given', [
            'session_id' => $session->id,
            'items'      => array_column($starterItems, 'item_name'),
        ]);
    }

    /**
     * Generate ALL remaining story turns in a single API call.
     * This is designed to be called ONCE per game session to minimize API usage.
     * Each turn includes branching outcomes so the player navigates client-side.
     */
    public function generateBatch(GameSession $session, string $playerChoice, array $inventory, int $batchSize = 20): array
    {
        $prompt = $this->buildGamePrompt($session, $playerChoice, $inventory, $batchSize);

        Log::info('LoreForge: generating story batch', [
            'session_id'    => $session->id,
            'turn_count'    => $session->turn_count,
            'genre'         => $session->genre,
            'player_choice' => $playerChoice,
            'batch_size'    => $batchSize,
        ]);

        try {
            $response = Http::timeout(120)
                ->post("{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature'     => 0.9,
                        'topK'            => 40,
                        'topP'            => 0.95,
                        'maxOutputTokens' => 16384,
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $generatedText = $data['candidates'][0]['content']['parts'][0]['text'];

                    Log::info('LoreForge: Gemini response received', [
                        'session_id'      => $session->id,
                        'response_length' => strlen($generatedText),
                        'preview'         => substr($generatedText, 0, 200),
                    ]);

                    return $this->parseGameBatch($generatedText);
                }

                throw new \Exception('Invalid response format from Gemini API');
            }

            // Rate limit handling
            if ($response->status() === 429) {
                throw new \Exception('Gemini rate limit reached. Please wait a moment and try again.');
            }

            // Service unavailable handling
            if ($response->status() === 503) {
                throw new \Exception('The story engine is currently experiencing high demand. Please wait a few moments and try again.');
            }

            throw new \Exception('Gemini API error: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('LoreForge Gemini Error', [
                'session_id' => $session->id,
                'error'      => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get available enemy names based on sprites for each genre
     */
    protected function getAvailableEnemies(string $genre): array
    {
        $enemies = [
            'fantasy' => [
                'Goblin Fire Thrower',
                'Goblin Demolitionist', 
                'Skeleton Archer',
                'Flaming Skull',
                'Skeleton King',
                'Armored Skeleton Spearman',
                'Armored Skeleton Swordsman'
            ],
            'horror' => [
                'Eldritch Boss',
                'Eldritch Guardian',
                'Eldritch Hunter',
                'Eldritch Minion'
            ],
            'scifi' => [
                'Robot Boss',
                'Robot Guardian',
                'Robot Pawn'
            ]
        ];

        return $enemies[strtolower($genre)] ?? $enemies['fantasy'];
    }

    /**
     * Get a structured enemy progression for the campaign.
     * Returns weak → mid → boss enemy names for this genre.
     */
    protected function getEnemyProgression(string $genre): array
    {
        $progression = [
            'fantasy' => [
                'weak'  => ['Goblin Fire Thrower', 'Goblin Demolitionist'],
                'mid'   => ['Skeleton Archer', 'Flaming Skull', 'Armored Skeleton Spearman', 'Armored Skeleton Swordsman'],
                'boss'  => ['Skeleton King'],
            ],
            'horror' => [
                'weak'  => ['Eldritch Minion'],
                'mid'   => ['Eldritch Hunter', 'Eldritch Guardian'],
                'boss'  => ['Eldritch Boss'],
            ],
            'scifi' => [
                'weak'  => ['Robot Pawn'],
                'mid'   => ['Robot Guardian'],
                'boss'  => ['Robot Boss'],
            ],
        ];

        return $progression[strtolower($genre)] ?? $progression['fantasy'];
    }

    /**
     * Build the Dungeon Master system prompt with full game state.
     */
    protected function buildGamePrompt(GameSession $session, string $playerChoice, array $inventory, int $batchSize): string
    {
        $genre         = ucfirst($session->genre);
        $character     = $session->character_name;
        $currentTurn   = $session->turn_count;
        $maxTurns      = $session->max_turns;
        $currentHP     = $session->current_health;
        $maxHP         = $session->max_health;
        $currentMP     = $session->current_mana;
        $maxMP         = $session->max_mana;
        $turnsLeft     = $maxTurns - $currentTurn;

        // Build detailed inventory string with descriptions
        $inventoryList = 'none';
        if (!empty($inventory)) {
            $itemCounts = array_count_values($inventory);
            $itemParts = [];
            foreach ($itemCounts as $name => $count) {
                $itemParts[] = "{$name} x{$count}";
            }
            $inventoryList = implode(', ', $itemParts);
        }

        // Get available enemies & progression for this genre
        $availableEnemies = $this->getAvailableEnemies($session->genre);
        $enemyList = implode(', ', $availableEnemies);
        $progression = $this->getEnemyProgression($session->genre);
        $weakEnemies = implode(', ', $progression['weak']);
        $midEnemies  = implode(', ', $progression['mid']);
        $bossEnemies = implode(', ', $progression['boss']);

        // Flee threshold: 10% of max HP
        $fleeThreshold = (int) floor($maxHP * 0.10);

        // MP threshold for magic abilities
        $mpThreshold = 10;

        // Determine which choices are available based on MP
        $mpLine = $currentMP >= $mpThreshold
            ? "The player has enough MP ({$currentMP}) for magic/special attacks. You may include magic attack choices that cost -5 to -15 MP."
            : "WARNING: The player's MP is LOW ({$currentMP}/{$maxMP}). Do NOT offer any magic or special attack choices. Only offer: basic melee attacks (mana_change: 0), utility actions (dodge, scan — mana_change: 0), or inventory item usage.";

        // Determine if flee is available
        $fleeLine = $currentHP <= $fleeThreshold
            ? "The player's HP is critically low ({$currentHP}/{$maxHP}, at or below {$fleeThreshold}). You MAY include a 'Flee' choice as one of the options."
            : "The player's HP ({$currentHP}/{$maxHP}) is above the flee threshold ({$fleeThreshold}). Do NOT include any 'Flee' choice.";

        // Tone and player role varies per genre
        $toneLine = match(strtolower($session->genre)) {
            'fantasy' => 'The tone is epic, magical, and heroic. The player is a brave Knight fighting against goblins and skeletons. Use medieval fantasy language and imagery.',
            'horror'  => 'The tone is dark, tense, and terrifying. The player is a combat Mech fighting against eldritch horrors and cosmic monsters. Build dread and suspense in every turn.',
            'scifi'   => 'The tone is futuristic, mysterious, and technological. The player is a humanoid Mech pilot fighting against giant enemy mechs and robots. Use sci-fi terminology and world-building.',
            default   => 'The tone is adventurous and immersive.',
        };

        // Ending pressure when near max turns
        $endingLine = $turnsLeft <= 3
            ? "IMPORTANT: The story is nearing its end ({$turnsLeft} turns remaining). Begin building toward a meaningful conclusion."
            : "The story has {$turnsLeft} turns remaining. Keep the narrative engaging and escalating.";

        // Calculate enemy arc turn ranges
        $weakEnd = (int) floor($maxTurns * 0.35);     // ~7 for 20 turns
        $midEnd  = (int) floor($maxTurns * 0.70);      // ~14 for 20 turns

        $prompt = <<<PROMPT
You are an expert Dungeon Master running a {$genre} interactive story game.

GAME STATE:
- Character: {$character}
- Genre: {$genre}
- Current Turn: {$currentTurn} / {$maxTurns}
- Health: {$currentHP} / {$maxHP}
- Mana: {$currentMP} / {$maxMP}
- Inventory: {$inventoryList}
- Player's last choice: "{$playerChoice}"

TONE: {$toneLine}
{$endingLine}

═══════════════════════════════════════════════
ENEMY RULES (STRICTLY ENFORCED)
═══════════════════════════════════════════════
- There is ALWAYS exactly ONE enemy on the battlefield at a time. NEVER describe 2 or more enemies fighting the player simultaneously.
- ONLY use exact enemy names from this list: {$enemyList}
- NEVER invent new enemy names outside this list.
- CAMPAIGN PROGRESSION — The player must face 2 to 3 DISTINCT enemies across the full campaign:
  * Turns 1 to {$weakEnd}: Use a WEAK enemy from: {$weakEnemies}
  * Turns {$weakEnd} to {$midEnd}: Use a MID-TIER enemy from: {$midEnemies}
  * Turns {$midEnd} to {$maxTurns}: Use the FINAL BOSS from: {$bossEnemies}
- When an enemy is defeated narratively, introduce the NEXT tier enemy in the following turn.
- Each arc MUST use a DIFFERENT enemy name so the frontend can display different sprites.

═══════════════════════════════════════════════
MANA (MP) RULES (STRICTLY ENFORCED)
═══════════════════════════════════════════════
{$mpLine}
- Magic/special attacks MUST cost mana: set mana_change to -5 to -15. Set action_type to "magic".
- CRITICAL: If a magic attack costs X mana, and the player's current MP ({$currentMP}) is less than X, you MUST NOT offer that attack. Never offer an attack whose mana cost exceeds the player's current MP.
- Basic melee attacks cost NO mana: set mana_change to 0. Set action_type to "attack".
- Utility actions (dodge, scan) cost NO mana: set mana_change to 0. Set action_type to "utility".
- Inventory item usage costs NO mana: set mana_change to 0. Set action_type to "item".

═══════════════════════════════════════════════
INVENTORY & ITEM RULES (STRICTLY ENFORCED)
═══════════════════════════════════════════════
- The player currently has: {$inventoryList}
- ITEM EFFECTS — you MUST apply these EXACT stat changes when an item is used:
  * "Healing Potion": set health_change to +25, set action_type to "item", set action_result to "success"
  * "Mana Potion": set mana_change to +20, set action_type to "item", set action_result to "success"
- When an item is used, you MUST add it to items_removed.
- The ONLY items that can be given via items_added are: "Healing Potion" and "Mana Potion". NEVER add weapons, equipment, or any other item type.
- You SHOULD sporadically give the player new potions using items_added (e.g., ["Healing Potion"], ["Mana Potion"]). This keeps the game balanced.
- If the player has items, AT LEAST ONE choice per turn MUST be an item-usage option.
- HP can NEVER exceed {$maxHP}. MP can NEVER exceed {$maxMP}. Clamp healing values accordingly.

═══════════════════════════════════════════════
DODGE / FLEE / UTILITY RULES (STRICTLY ENFORCED)
═══════════════════════════════════════════════
DODGE:
- If the player chooses to dodge and it SUCCEEDS: health_change MUST be 0, enemy_hp_change MUST be 0, action_type = "utility", action_result = "success". Story should say the player evaded the attack.
- If the player chooses a dodge-and-counter style action and it SUCCEEDS: health_change MUST be 0, enemy_hp_change MUST be -20 to -35, action_type = "utility", action_result = "success". Story should say the player dodged first, then counterattacked.
- If the player chooses to dodge and it FAILS: apply normal damage to player, action_type = "utility", action_result = "fail". Story should say the dodge failed.

FLEE:
{$fleeLine}
- If flee SUCCEEDS: health_change = 0, enemy_hp_change = 0, action_type = "flee", action_result = "success". Story should say the player escaped.
- If flee FAILS: apply heavy damage to player (-20 to -30), action_type = "flee", action_result = "fail". Story should say the escape attempt failed.

SCAN / OTHER UTILITY:
- Scan reveals enemy weakness. action_type = "utility", action_result = "success". No damage dealt or taken.

═══════════════════════════════════════════════
DIFFICULTY & STAT RULES
═══════════════════════════════════════════════
- Make the game HARD. The player SHOULD feel in danger of dying.
- BAD choices MUST deal severe Health damage (-20 to -45).
- GOOD/Neutral choices should deal minor damage (-5 to -15) or no damage.
- Enemy HP changes: -20 to -60 for good attacks.
- Bosses must be hard to kill (require multiple turns of good choices).
- ON THE FINAL TURN ({$maxTurns}), the successful choices MUST deal massive enemy damage (-120) to officially kill the final boss and achieve a true VICTORY.

═══════════════════════════════════════════════
STORY PACING (MUST FOLLOW)
═══════════════════════════════════════════════
You MUST generate EXACTLY {$batchSize} turns. The story MUST reach a definitive ending on the FINAL turn ({$maxTurns}).
- Turns 1-5: Introduce setting, first weak enemy encounter.
- Turns 6-{$weakEnd}: Escalate conflict, find items, defeat weak enemy.
- Turns {$weakEnd}-{$midEnd}: Mid-tier enemy appears, higher tension.
- Turns {$midEnd}-{$maxTurns}: Final Boss battle. Turn {$maxTurns} MUST have the definitive killing blow option.

═══════════════════════════════════════════════
ACTION TYPE & RESULT (REQUIRED IN EVERY OUTCOME)
═══════════════════════════════════════════════
Every outcome object MUST include:
- "action_type": one of "attack", "magic", "defend", "heal", "utility", "flee", "item"
- "action_result": one of "success", "fail", "neutral"

STRICT CLASSIFICATION RULES:
- If a choice name contains words like: attack, strike, slash, cut, thrust, melee, blow, assault, smash, bash, charge, lunge, or names an offensive weapon-based combat option, the action_type MUST be "attack". NEVER set it to "utility" or "scan".
- If the action uses/fires magic, spells, mana, laser beams, rockets, or direct energy, and costs mana (negative mana_change), the action_type MUST be "magic".
- "Scan", "Analyze", "Inspect", "Examine", "Assess" type choices → action_type MUST be "utility". NEVER name a melee or direct attack choice using scan/inspect/analyze language.
- Only use "utility" for pure defensive/dodging/utility/movement options, not physical damage dealing melee/combat options.
- Only use "item" for consuming inventory potions ("Healing Potion", "Mana Potion").

These tell the frontend which visual effect to play:
- attack + success = physical slash effect on enemy
- magic + success = genre-specific magic projectile animation (fantasy: fireball, sci-fi: laser beam, horror: green rocket arc)
- item (heal) + success = green heal glow on player
- item (mana) + success = blue mana glow on player
- utility (dodge) + success = dodge sidestep animation
- utility (dodge) + fail = player gets hit
- flee + success = player escapes
- flee + fail = player gets hit hard


═══════════════════════════════════════════════
STRICT FORMATTING RULES
═══════════════════════════════════════════════
1. Story must be consistent and escalate.
2. Each turn: exactly 2 to 4 choices.
3. Keep story_text CONCISE: 2-3 sentences max.
4. Keep outcome story text to 1 sentence.
5. NEVER break character. NEVER mention JSON, APIs, or technical details.
6. Each choice text should be SHORT (3-6 words max).

CRITICAL: Start your response immediately with { — no markdown, no code blocks, no explanations.
Return ONLY valid raw JSON. No trailing commas. Strict double quotes on all keys and string values.

REQUIRED JSON FORMAT:
{
  "batch": [
    {
      "turn_number": {$currentTurn},
      "enemy_name": "Goblin Fire Thrower",
      "story_text": "Concise narrative, 2-3 sentences.",
      "choices": ["Slash Attack", "Use Healing Potion", "Dodge Roll", "Fireball"],
      "outcomes": {
        "Slash Attack": {
          "story": "One sentence outcome.",
          "health_change": -10,
          "mana_change": 0,
          "enemy_hp_change": -30,
          "items_added": [],
          "items_removed": [],
          "action_type": "attack",
          "action_result": "success"
        },
        "Use Healing Potion": {
          "story": "You drink the potion and feel vitality surge through you.",
          "health_change": 25,
          "mana_change": 0,
          "enemy_hp_change": 0,
          "items_added": [],
          "items_removed": ["Healing Potion"],
          "action_type": "item",
          "action_result": "success"
        },
        "Dodge Roll": {
          "story": "You narrowly sidestep the enemy's strike.",
          "health_change": 0,
          "mana_change": 0,
          "enemy_hp_change": 0,
          "items_added": [],
          "items_removed": [],
          "action_type": "utility",
          "action_result": "success"
        },
        "Fireball": {
          "story": "A blazing fireball engulfs the enemy.",
          "health_change": 0,
          "mana_change": -10,
          "enemy_hp_change": -45,
          "items_added": [],
          "items_removed": [],
          "action_type": "magic",
          "action_result": "success"
        }
      }
    }
  ]
}

Generate ALL {$batchSize} turns now. Remember: ONLY raw JSON, starting with {
PROMPT;

        return $prompt;
    }

    /**
     * Parse and validate the batch JSON returned by Gemini.
     * Reuses the same cleaning logic from the travel planner.
     */
    protected function parseGameBatch(string $generatedText): array
    {
        // Clean markdown wrappers if Gemini adds them anyway
        $generatedText = preg_replace('/```json\s*/i', '', $generatedText);
        $generatedText = preg_replace('/```\s*$/',     '', $generatedText);
        $generatedText = preg_replace('/```/',         '', $generatedText);

        // Remove JS-style comments
        $generatedText = preg_replace('#//.*#',      '', $generatedText);
        $generatedText = preg_replace('#/\*.*?\*/#s', '', $generatedText);

        // Trim and extract JSON object
        $generatedText = trim($generatedText);

        // Strip double-braces Gemini sometimes echoes back ({{ ... }})
        $generatedText = preg_replace('/^\{\{/', '{',  $generatedText);
        $generatedText = preg_replace('/\}\}$/', '}',  $generatedText);

        if (preg_match('/\{[\s\S]*\}/', $generatedText, $matches)) {
            $generatedText = $matches[0];
        }

        // Fix trailing commas
        $generatedText = preg_replace('/(,\s*[}\]])/', '$1', $generatedText);

        $data = json_decode($generatedText, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $error = json_last_error_msg();
            Log::error('LoreForge: JSON parse failed', [
                'error'   => $error,
                'preview' => substr($generatedText, 0, 500),
            ]);
            throw new \Exception('Story generation returned invalid data. Please try again. (' . $error . ')');
        }

        if (empty($data['batch']) || !is_array($data['batch'])) {
            Log::error('LoreForge: batch key missing or empty', [
                'keys'    => array_keys($data ?? []),
                'preview' => substr($generatedText, 0, 500),
            ]);
            throw new \Exception('Story generation returned an incomplete batch. Please try again.');
        }

        // Validate each turn in the batch and apply defaults for new fields
        foreach ($data['batch'] as $index => &$turn) {
            $required = ['turn_number', 'enemy_name', 'story_text', 'choices', 'outcomes'];
            foreach ($required as $field) {
                if (!isset($turn[$field])) {
                    throw new \Exception("Turn {$index} is missing field: {$field}. Please try again.");
                }
            }

            if (empty($turn['choices']) || count($turn['choices']) < 2 || count($turn['choices']) > 4) {
                throw new \Exception("Turn {$index} must have 2 to 4 choices. Please try again.");
            }

            // Apply defaults for action_type and action_result on each outcome
            if (is_array($turn['outcomes'])) {
                foreach ($turn['outcomes'] as $choiceKey => &$outcome) {
                    if (!isset($outcome['action_type'])) {
                        $outcome['action_type'] = 'attack';
                    }
                    if (!isset($outcome['action_result'])) {
                        $outcome['action_result'] = 'neutral';
                    }
                    if (!isset($outcome['items_added'])) {
                        $outcome['items_added'] = [];
                    }
                    if (!isset($outcome['items_removed'])) {
                        $outcome['items_removed'] = [];
                    }
                }
                unset($outcome);
            }
        }
        unset($turn);

        Log::info('LoreForge: batch parsed successfully', [
            'turns_in_batch' => count($data['batch']),
        ]);

        return $data['batch'];
    }
}
