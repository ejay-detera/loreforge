<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\GameSession;

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
     * Generate ALL remaining story turns in a single API call.
     * This is designed to be called ONCE per game session to minimize API usage.
     * Each turn includes branching outcomes so the player navigates client-side.
     */
    public function generateBatch(GameSession $session, string $playerChoice, array $inventory, int $batchSize = 20): array
    {
        // ── Check daily limit BEFORE making the API call ──────────────────────
        // DISABLED: Daily limit check removed
        /*
        if ($this->isLimitReached()) {
            Log::warning('LoreForge: Gemini daily limit reached', [
                'session_id'     => $session->id,
                'requests_today' => $this->getRequestsToday(),
                'limit'          => self::DAILY_LIMIT,
            ]);
            throw new \Exception(
                'The story engine has reached its daily limit of ' . self::DAILY_LIMIT . ' requests. ' .
                'Please come back tomorrow to continue your adventure!'
            );
        }
        */

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
        $inventoryList = !empty($inventory) ? implode(', ', $inventory) : 'none';
        
        // Get available enemies for this genre
        $availableEnemies = $this->getAvailableEnemies($session->genre);
        $enemyList = implode(', ', $availableEnemies);

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

ENEMY RULES (CAMPAIGN STRUCTURE):
- ONLY use exact enemy names from this list: {$enemyList}
- NEVER invent enemy names.
- CYCLE ENEMIES: This is a full campaign. Start with weak enemies (e.g., Grunts/Minions), and progress to harder ones. 
- When an enemy is narratively defeated, introduce a DIFFERENT enemy from the list in the next turn.
- FINAL BOSS: The final turns MUST feature the Boss from the list (Skeleton King, Eldritch Boss, Robot Boss).

INVENTORY RULES:
- The player currently has: {$inventoryList}
- You MUST sporadically give the player new items using `items_added` (e.g., ["Holy Sword", "Healing Potion"]). Always give them highly relevant items!
- If the player has items, AT LEAST ONE choice per turn MUST utilize an item.
- When an item is utilized, YOU MUST remove it in that choice's outcome by adding it to `items_removed` (e.g., ["Healing Potion"]).
- Inventory matters: A player with a weapon should have better offensive choices!

DIFFICULTY & STAT RULES:
- Make the game HARD. The player SHOULD feel in danger of dying.
- BAD choices MUST deal severe Health damage (-20 to -45).
- GOOD/Neutral choices should deal minor damage (-5 to -15) or no damage.
- Using a Healing item must heal Health (+20 to +40).
- Enemy HP changes: -20 to -60 for good attacks.
- Bosses must be hard to kill (require multiple turns of good choices).
- ON THE FINAL TURN ({$maxTurns}), the successful choices MUST deal massive enemy damage (-120) to officially kill the final boss and achieve a true VICTORY.

YOUR TASK:
Generate the next {$batchSize} story turns as a single JSON response.
Each turn has branching outcomes (one per choice) so the player navigates entirely client-side.

Because this is a chunk of the adventure, you MUST advance the narrative appropriately for the current Turn:
- Turn 1-5: Introduce setting, first weak enemy.
- Turn 6-13: Escalate conflict, find powerful items, cycle to stronger enemies.
- Turn 14-{$maxTurns}: The climax against the Final Boss. Turn {$maxTurns} must contain the definitive killing blow.

STRICT FORMATTING RULES:
1. Story must consistent and escalate.
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
      "choices": ["Choice A", "Choice B", "Choice C"],
      "outcomes": {
        "Choice A": {
          "story": "One sentence outcome.",
          "health_change": 0,
          "mana_change": -5,
          "enemy_hp_change": -20,
          "items_added": [],
          "items_removed": []
        },
        "Choice B": {
          "story": "One sentence outcome.",
          "health_change": -15,
          "mana_change": 0,
          "enemy_hp_change": 0,
          "items_added": ["Health Potion"],
          "items_removed": []
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

        // Validate each turn in the batch
        foreach ($data['batch'] as $index => $turn) {
            $required = ['turn_number', 'enemy_name', 'story_text', 'choices', 'outcomes'];
            foreach ($required as $field) {
                if (!isset($turn[$field])) {
                    throw new \Exception("Turn {$index} is missing field: {$field}. Please try again.");
                }
            }

            if (empty($turn['choices']) || count($turn['choices']) < 2 || count($turn['choices']) > 4) {
                throw new \Exception("Turn {$index} must have 2 to 4 choices. Please try again.");
            }
        }

        Log::info('LoreForge: batch parsed successfully', [
            'turns_in_batch' => count($data['batch']),
        ]);

        return $data['batch'];
    }
}