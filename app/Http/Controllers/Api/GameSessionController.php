<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\TurnBatch;
use App\Models\Turn;
use App\Models\InventoryItem;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GameSessionController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Start a new game session
     */
    public function start(Request $request)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $validated = $request->validate([
            'genre' => 'required|string|in:fantasy,horror,scifi',
            'character_name' => 'required|string|max:255',
            'max_turns' => 'sometimes|integer|min:5|max:50',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                // Auto-abandon any existing active session for this user
                GameSession::where('user_id', Auth::id())
                    ->where('status', 'active')
                    ->update(['status' => 'abandoned']);

                // Create new game session manually to handle non-fillable fields
                $session = new GameSession([
                    'genre' => $validated['genre'],
                    'character_name' => $validated['character_name'],
                    'current_health' => 100,
                    'max_health' => 100,
                    'current_mana' => 50,
                    'max_mana' => 50,
                    'turn_count' => 0,
                    'max_turns' => $validated['max_turns'] ?? 20,
                    'is_public' => false,
                ]);
                
                $session->user_id = Auth::id();
                $session->status = 'active';
                $session->outcome = null;
                $session->save();

                // Seed starter inventory items (2x Healing Potion, 2x Mana Potion)
                $this->geminiService->giveStarterItems($session);

                Log::info('LoreForge: New game session started', [
                    'session_id' => $session->id,
                    'user_id' => Auth::id(),
                    'genre' => $session->genre,
                    'character_name' => $session->character_name,
                ]);

                return response()->json([
                    'success' => true,
                    'session' => $session->load(['inventoryItems']),
                    'message' => 'New adventure begun! Your journey starts now...'
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('LoreForge: Failed to start game session', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start new game. Please try again.'
            ], 500);
        }
    }

    /**
     * Generate a new batch of turns
     */
    public function generateBatch(Request $request, $sessionId)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        try {
            $session = GameSession::where('id', $sessionId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Check if session is still active
            if ($session->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'This game session is no longer active.'
                ], 400);
            }

            // Check daily limit - DISABLED
            /*
            if ($this->geminiService->isLimitReached()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Daily story generation limit reached. Please try again tomorrow.',
                    'remaining_requests' => 0,
                    'limit' => $this->geminiService::DAILY_LIMIT,
                ], 429);
            }
            */

            // Get current inventory
            $inventory = $session->inventoryItems()
                ->whereNull('removed_at')
                ->pluck('item_name')
                ->toArray();

            // Get last player choice (from the most recent resolved turn)
            $lastTurn = $session->turns()
                ->where('is_resolved', true)
                    ->orderBy('turn_number', 'desc')
                    ->first();

            $playerChoice = $lastTurn ? $lastTurn->player_choice : 'start';

            // Check if there are already unresolved turns in a batch
            $existingUnresolvedTurns = $session->turns()
                ->where('is_resolved', false)
                ->orderBy('turn_number', 'asc')
                ->get();

            if ($existingUnresolvedTurns->isNotEmpty()) {
                Log::info('LoreForge: Returning existing generated batch', [
                    'session_id' => $session->id,
                    'turns_count' => count($existingUnresolvedTurns),
                ]);

                return response()->json([
                    'success' => true,
                    'batch' => [
                        'id' => $existingUnresolvedTurns->first()->batch_id,
                        'batch_number' => $existingUnresolvedTurns->first()->batch_id,
                        'turns' => $existingUnresolvedTurns,
                    ],
                    'message' => 'Restored existing generated turns.'
                ]);
            }

            // Generate next 5 turns in a single Gemini call
            return DB::transaction(function () use ($session, $playerChoice, $inventory) {
                // Determine batch size (max 5 at a time to prevent Gemini context/timeout issues)
                $batchSize = min(5, max(1, $session->max_turns - $session->turn_count));
                $generatedTurns = $this->geminiService->generateBatch(
                    $session,
                    $playerChoice,
                    $inventory,
                    $batchSize
                );

                // Create TurnBatch record
                $batchNumber = $session->turns()->max('batch_id') + 1;
                $turnBatch = TurnBatch::create([
                    'session_id' => $session->id,
                    'batch_number' => $batchNumber,
                    'turns_generated' => count($generatedTurns),
                    'player_choice_trigger' => $playerChoice,
                ]);

                // Save all generated turns
                $savedTurns = [];
                foreach ($generatedTurns as $turnData) {
                    $turn = Turn::create([
                        'session_id' => $session->id,
                        'batch_id' => $turnBatch->id,
                        'turn_number' => $turnData['turn_number'],
                        'story_text' => $turnData['story_text'],
                        'choices' => $turnData['choices'],
                        'outcomes' => $turnData['outcomes'],
                        'player_choice' => null, // Will be set when resolved
                        'health_change' => 0,
                        'mana_change' => 0,
                        'enemy_hp_change' => 0,
                        'is_resolved' => false,
                    ]);
                    $savedTurns[] = $turn;
                }

                Log::info('LoreForge: New turn batch generated', [
                    'session_id' => $session->id,
                    'batch_id' => $turnBatch->id,
                    'turns_generated' => count($generatedTurns),
                    'player_choice' => $playerChoice,
                ]);

                // Increment request counter ONLY after successful API call AND database storage
                $this->geminiService->incrementRequestCount();

                return response()->json([
                    'success' => true,
                    'batch' => [
                        'id' => $turnBatch->id,
                        'batch_number' => $turnBatch->batch_number,
                        'turns' => $savedTurns,
                    ],
                    'remaining_requests' => $this->geminiService->getRemainingRequests(),
                    'message' => 'New story turns generated successfully!'
                ]);
            });
        } catch (\Exception $e) {
            Log::error('LoreForge: Failed to generate batch', [
                'session_id' => $sessionId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate story turns. Please try again.'
            ], 500);
        }
    }

    /**
     * Resolve a player's choice for a specific turn
     */
    public function resolveTurn(Request $request, $sessionId, $turnId)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $validated = $request->validate([
            'choice' => 'required|string|max:255',
        ]);

        try {
            return DB::transaction(function () use ($sessionId, $turnId, $validated) {
                $session = GameSession::where('id', $sessionId)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

                $turn = Turn::where('id', $turnId)
                    ->where('session_id', $sessionId)
                    ->where('is_resolved', false)
                    ->firstOrFail();

                // Validate player's choice exists in turn outcomes
                if (!isset($turn->outcomes[$validated['choice']])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid choice selected.'
                    ], 400);
                }

                $outcome = $turn->outcomes[$validated['choice']];

                $healthChange = $outcome['health_change'] ?? 0;
                $manaChange = $outcome['mana_change'] ?? 0;
                $enemyHpChange = $outcome['enemy_hp_change'] ?? 0;

                // Force values if Gemini hallucinated 0
                $choiceLower = strtolower($validated['choice']);
                $isDodgeAction = str_contains($choiceLower, 'dodge')
                    || str_contains($choiceLower, 'evade')
                    || str_contains($choiceLower, 'roll')
                    || str_contains($choiceLower, 'sidestep')
                    || str_contains($choiceLower, 'parry')
                    || str_contains($choiceLower, 'counter');
                $isScanAction = str_contains($choiceLower, 'scan')
                    || str_contains($choiceLower, 'analyze')
                    || str_contains($choiceLower, 'analyse')
                    || str_contains($choiceLower, 'inspect');

                if ($isDodgeAction) {
                    $healthChange = min(0, $healthChange);
                    $manaChange = 0;
                    if (str_contains($choiceLower, 'counter') && $enemyHpChange === 0) {
                        $enemyHpChange = -20;
                    }
                } elseif ($isScanAction) {
                    $healthChange = 0;
                    $manaChange = 0;
                    $enemyHpChange = 0;
                }

                if (str_contains($choiceLower, 'healing potion') || str_contains($choiceLower, 'hp potion')) {
                    $healthChange = max(25, $healthChange);
                }
                if (str_contains($choiceLower, 'mana potion') || str_contains($choiceLower, 'mp potion')) {
                    $manaChange = max(20, $manaChange);
                }

                // Update turn with player's choice and outcome changes
                $turn->update([
                    'player_choice' => $validated['choice'],
                    'health_change' => $healthChange,
                    'mana_change' => $manaChange,
                    'enemy_hp_change' => $enemyHpChange,
                    'is_resolved' => true,
                ]);

                // Apply health and mana changes to session with min/max caps
                $newHealth = max(0, min($session->max_health, 
                    $session->current_health + $healthChange));
                $newMana = max(0, min($session->max_mana, 
                    $session->current_mana + $manaChange));

                $session->update([
                    'current_health' => $newHealth,
                    'current_mana' => $newMana,
                    'turn_count' => $session->turn_count + 1,
                ]);

                // Handle inventory changes
                $inventoryChanges = [];

                // Add items
                if (!empty($outcome['items_added'])) {
                    foreach ($outcome['items_added'] as $itemName) {
                        InventoryItem::create([
                            'session_id' => $session->id,
                            'item_name' => $itemName,
                            'description' => "Acquired during turn {$turn->turn_number}",
                            'acquired_at' => $session->turn_count + 1,
                            'removed_at' => null,
                        ]);
                        $inventoryChanges[] = "Added: {$itemName}";
                    }
                }

                // Remove items
                if (!empty($outcome['items_removed'])) {
                    foreach ($outcome['items_removed'] as $itemName) {
                        $item = InventoryItem::where('session_id', $session->id)
                            ->where('item_name', $itemName)
                            ->whereNull('removed_at')
                            ->first();
                        
                        if ($item) {
                            $item->update(['removed_at' => $session->turn_count + 1]);
                            $inventoryChanges[] = "Removed: {$itemName}";
                        }
                    }
                }

                // Check for game over conditions
                $isGameOver = $newHealth <= 0;
                $isVictory = $session->turn_count >= $session->max_turns;

                if ($isGameOver || $isVictory) {
                    $session->status = $isGameOver ? 'defeated' : 'victory';
                    $session->outcome = $isGameOver ? 'defeat' : 'victory';
                    $session->save();

                    Log::info('LoreForge: Game session ended', [
                        'session_id' => $session->id,
                        'status' => $session->status,
                        'outcome' => $session->outcome,
                        'turns_played' => $session->turn_count,
                    ]);
                }

                // Get updated inventory
                $updatedInventory = $session->inventoryItems()
                    ->whereNull('removed_at')
                    ->get();

                Log::info('LoreForge: Turn resolved', [
                    'session_id' => $session->id,
                    'turn_id' => $turn->id,
                    'choice' => $validated['choice'],
                    'health_change' => $healthChange,
                    'mana_change' => $manaChange,
                    'new_health' => $newHealth,
                    'new_mana' => $newMana,
                ]);

                return response()->json([
                    'success' => true,
                    'session' => [
                        'id' => $session->id,
                        'current_health' => $newHealth,
                        'max_health' => $session->max_health,
                        'current_mana' => $newMana,
                        'max_mana' => $session->max_mana,
                        'turn_count' => $session->turn_count,
                        'max_turns' => $session->max_turns,
                        'status' => $session->status,
                        'outcome' => $session->outcome,
                        'is_game_over' => $isGameOver || $isVictory,
                        'is_victory' => $isVictory,
                    ],
                    'inventory' => $updatedInventory,
                    'inventory_changes' => $inventoryChanges,
                    'resolved_turn' => [
                        'id' => $turn->id,
                        'turn_number' => $turn->turn_number,
                        'player_choice' => $validated['choice'],
                        'outcome_story' => $outcome['story'] ?? '',
                    ],
                    'message' => $isGameOver ? 'Your adventure has ended in defeat.' : 
                                ($isVictory ? 'Congratulations! You have achieved victory!' : 
                                'Turn resolved successfully.')
                ]);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Game session or turn not found.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('LoreForge: Failed to resolve turn', [
                'session_id' => $sessionId,
                'turn_id' => $turnId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve turn. Please try again.'
            ], 500);
        }
    }

    /**
     * Get detailed history of a session
     */
    public function getSessionDetails($sessionId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        try {
            $session = GameSession::where('user_id', Auth::id())
                ->with(['turns' => function($q) {
                    $q->orderBy('turn_number', 'asc');
                }])
                ->findOrFail($sessionId);

            return response()->json([
                'success' => true,
                'session' => $session
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Game session not found.'
            ], 404);
        }
    }

    /**
     * Share a completed game session
     */
    public function share(Request $request, $sessionId)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        try {
            return DB::transaction(function () use ($sessionId) {
                $session = GameSession::where('id', $sessionId)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

                if (!in_array($session->outcome, ['victory', 'defeat'])) {
                    return response()->json(['success' => false, 'message' => 'Only completed games can be shared.'], 400);
                }

                if ($session->is_public) {
                    return response()->json(['success' => false, 'message' => 'Session is already shared.'], 400);
                }

                // Generate story preview from first 2 resolved turns
                $turns = $session->turns()->where('is_resolved', true)->orderBy('turn_number', 'asc')->take(2)->get();
                $previewText = '';
                foreach ($turns as $turn) {
                    $previewText .= $turn->story_text . ' ';
                }
                
                // Truncate to reasonable length
                $previewText = mb_strimwidth(trim($previewText), 0, 250, '...');
                if (empty($previewText)) {
                    $previewText = 'A mysterious adventure...';
                }

                \App\Models\SharedCampaign::create([
                    'session_id' => $session->id,
                    'shared_by' => Auth::id(),
                    'story_preview' => $previewText,
                    'shared_at' => now(),
                ]);

                $session->update(['is_public' => true]);

                return response()->json(['success' => true, 'message' => 'Campaign shared successfully!']);
            });
        } catch (\Exception $e) {
            Log::error('Share error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to share campaign.'], 500);
        }
    }

    /**
     * Unshare a game session
     */
    public function unshare(Request $request, $sessionId)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        try {
            return DB::transaction(function () use ($sessionId) {
                $session = GameSession::where('id', $sessionId)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

                if (!$session->is_public) {
                    return response()->json(['success' => false, 'message' => 'Session is not shared.'], 400);
                }

                \App\Models\SharedCampaign::where('session_id', $session->id)->delete();
                $session->update(['is_public' => false]);

                return response()->json(['success' => true, 'message' => 'Campaign unshared successfully.']);
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to unshare campaign.'], 500);
        }
    }
}
