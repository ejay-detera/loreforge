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
    const DAILY_LIMIT     = 20;
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
        return max(0, self::DAILY_LIMIT - $this->getRequestsToday());
    }

    /**
     * Check if the daily limit has been reached.
     */
    public function isLimitReached(): bool
    {
        return $this->getRequestsToday() >= self::DAILY_LIMIT;
    }

    /**
     * Increment the daily request counter.
     * Automatically resets at midnight (stores until end of day).
     */
    protected function incrementRequestCount(): void
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
     * Generate a batch of 3-5 story turns based on current game state.
     * Called when the client-side turn buffer runs out.
     */
    public function generateBatch(GameSession $session, string $playerChoice, array $inventory, int $batchSize = 4): array
    {
        // ── Check daily limit BEFORE making the API call ──────────────────────
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

        $prompt = $this->buildGamePrompt($session, $playerChoice, $inventory, $batchSize);

        Log::info('LoreForge: generating story batch', [
            'session_id'    => $session->id,
            'turn_count'    => $session->turn_count,
            'genre'         => $session->genre,
            'player_choice' => $playerChoice,
            'batch_size'    => $batchSize,
        ]);

        try {
            $response = Http::timeout(60)
                ->post("{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature'     => 0.9,   // Higher = more creative story
                        'topK'            => 40,
                        'topP'            => 0.95,
                        'maxOutputTokens' => 4096,
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

                    // Increment counter ONLY on a successful response
                    $this->incrementRequestCount();

                    return $this->parseGameBatch($generatedText);
                }

                throw new \Exception('Invalid response format from Gemini API');
            }

            // Rate limit handling
            if ($response->status() === 429) {
                throw new \Exception('Gemini rate limit reached. Please wait a moment and try again.');
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

        // Tone varies per genre
        $toneLine = match(strtolower($session->genre)) {
            'fantasy' => 'The tone is epic, magical, and heroic. Use medieval fantasy language and imagery.',
            'horror'  => 'The tone is dark, tense, and terrifying. Build dread and suspense in every turn.',
            'scifi'   => 'The tone is futuristic, mysterious, and technological. Use sci-fi terminology and world-building.',
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

YOUR TASK:
Continue the story from the player's last choice and generate exactly {$batchSize} upcoming story turns as a JSON batch.
For each turn, also generate ALL possible branching outcomes — one outcome object per choice.
The player will pick one choice per turn and navigate client-side without needing another API call.

STRICT RULES:
1. Keep the story consistent with all previous choices and the current game state.
2. Health changes must be between -30 and +20. Mana changes between -15 and +10.
3. Enemy HP changes must be between -40 and 0 (enemy only loses HP, never gains).
4. Items added or removed must make sense for the {$genre} genre.
5. The final turn in the batch (turn {$maxTurns}) must be a story conclusion if this is the last batch.
6. NEVER break character. NEVER mention JSON, APIs, or technical details in the story text.
7. Each turn must have exactly 2 to 4 choices. No more, no less.
8. Do NOT copy choices from previous turns.

CRITICAL: Start your response immediately with {{ — no markdown, no code blocks, no explanations.
Return ONLY valid raw JSON. No trailing commas. Strict double quotes on all keys and string values.

REQUIRED JSON FORMAT:
{{
  "batch": [
    {{
      "turn_number": {$currentTurn},
      "story_text": "Narrative text describing what happens after the player's last choice. 2-4 sentences.",
      "choices": ["Choice A", "Choice B", "Choice C"],
      "outcomes": {{
        "Choice A": {{
          "story": "Brief 1-2 sentence preview of what happens if the player picks Choice A.",
          "health_change": 0,
          "mana_change": -5,
          "enemy_hp_change": -20,
          "items_added": [],
          "items_removed": []
        }},
        "Choice B": {{
          "story": "Brief 1-2 sentence preview of what happens if the player picks Choice B.",
          "health_change": -15,
          "mana_change": 0,
          "enemy_hp_change": 0,
          "items_added": ["Health Potion"],
          "items_removed": []
        }}
      }}
    }}
  ]
}}

Generate the batch now. Remember: ONLY raw JSON, starting with {{
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
            $required = ['turn_number', 'story_text', 'choices', 'outcomes'];
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