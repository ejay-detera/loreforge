<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\SharedCampaign;
use App\Models\Turn;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommunityController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    public function index(Request $request)
    {
        $genre = $request->query('genre');

        $query = SharedCampaign::with([
            'gameSession:id,character_name,genre,turn_count,outcome',
            'sharedByUser:id,username'
        ]);

        if ($genre && $genre !== 'all') {
            $query->whereHas('gameSession', function ($q) use ($genre) {
                $q->where('genre', $genre);
            });
        }

        $campaigns = $query->orderBy('shared_at', 'desc')->paginate(12);

        // Format for frontend
        $formatted = $campaigns->map(function ($campaign) {
            return [
                'id' => $campaign->id,
                'session_id' => $campaign->session_id,
                'character_name' => $campaign->gameSession->character_name,
                'genre' => $campaign->gameSession->genre,
                'author' => $campaign->sharedByUser->username,
                'turn_count' => $campaign->gameSession->turn_count,
                'outcome' => $campaign->gameSession->outcome,
                'story_preview' => $campaign->story_preview,
                'shared_at' => $campaign->shared_at->diffForHumans(),
            ];
        });

        return response()->json([
            'success' => true,
            'campaigns' => $formatted,
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'total' => $campaigns->total(),
                'has_more' => $campaigns->hasMorePages()
            ]
        ]);
    }

    public function show($campaignId)
    {
        try {
            $campaign = SharedCampaign::with([
                'gameSession',
                'sharedByUser:id,username'
            ])->findOrFail($campaignId);

            // Get resolved turns
            $turns = Turn::where('session_id', $campaign->session_id)
                ->where('is_resolved', true)
                ->orderBy('turn_number', 'asc')
                ->get();

            // Format stats
            $session = $campaign->gameSession;
            $details = [
                'id' => $campaign->id,
                'session_id' => $session->id,
                'character_name' => $session->character_name,
                'genre' => $session->genre,
                'author' => $campaign->sharedByUser->username,
                'current_health' => $session->current_health,
                'max_health' => $session->max_health,
                'current_mana' => $session->current_mana,
                'max_mana' => $session->max_mana,
                'turn_count' => $session->turn_count,
                'max_turns' => $session->max_turns,
                'outcome' => $session->outcome,
                'shared_at' => $campaign->shared_at->format('F j, Y'),
                'turns' => $turns
            ];

            return response()->json([
                'success' => true,
                'campaign' => $details
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found.'
            ], 404);
        }
    }

    public function replay(Request $request, $campaignId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $validated = $request->validate([
            'character_name' => 'nullable|string|max:255',
        ]);

        try {
            return DB::transaction(function () use ($campaignId, $validated) {
                $campaign = SharedCampaign::with('gameSession')->findOrFail($campaignId);
                $originalSession = $campaign->gameSession;

                // Auto-abandon active session
                GameSession::where('user_id', Auth::id())
                    ->where('status', 'active')
                    ->update(['status' => 'abandoned']);

                $charName = $validated['character_name'] ?: Auth::user()->username;

                // Create new session
                $session = GameSession::create([
                    'user_id' => Auth::id(),
                    'genre' => $originalSession->genre,
                    'character_name' => $charName,
                    'current_health' => 100,
                    'max_health' => 100,
                    'current_mana' => 50,
                    'max_mana' => 50,
                    'turn_count' => 0,
                    'max_turns' => $originalSession->max_turns,
                    'status' => 'active',
                    'outcome' => null,
                    'is_public' => false,
                ]);

                // Seed starter inventory items
                $this->geminiService->giveStarterItems($session);

                return response()->json([
                    'success' => true,
                    'session' => $session,
                    'message' => 'Replay started successfully.'
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('LoreForge: Failed to start replay', [
                'user_id' => Auth::id(),
                'campaign_id' => $campaignId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start replay.'
            ], 500);
        }
    }
}
