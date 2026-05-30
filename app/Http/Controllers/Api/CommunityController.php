<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignComment;
use App\Models\CampaignRating;
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

    /**
     * List shared campaigns with genre filter + pagination.
     * Now includes avg_rating and ratings_count.
     */
    public function index(Request $request)
    {
        $genre = $request->query('genre');

        $query = SharedCampaign::with([
            'gameSession:id,character_name,genre,turn_count,outcome',
            'sharedByUser:id,username',
        ])->withAvg('ratings', 'rating')
          ->withCount('ratings');

        if ($genre && $genre !== 'all') {
            $query->whereHas('gameSession', function ($q) use ($genre) {
                $q->where('genre', $genre);
            });
        }

        $campaigns = $query->orderBy('shared_at', 'desc')->paginate(12);

        $formatted = $campaigns->map(function ($campaign) {
            return [
                'id'             => $campaign->id,
                'session_id'     => $campaign->session_id,
                'character_name' => $campaign->gameSession->character_name,
                'genre'          => $campaign->gameSession->genre,
                'author'         => $campaign->sharedByUser->username,
                'turn_count'     => $campaign->gameSession->turn_count,
                'outcome'        => $campaign->gameSession->outcome,
                'story_preview'  => $campaign->story_preview,
                'shared_at'      => $campaign->shared_at->diffForHumans(),
                'avg_rating'     => $campaign->ratings_avg_rating
                    ? round((float) $campaign->ratings_avg_rating, 1)
                    : null,
                'ratings_count'  => (int) $campaign->ratings_count,
            ];
        });

        return response()->json([
            'success'    => true,
            'campaigns'  => $formatted,
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page'    => $campaigns->lastPage(),
                'total'        => $campaigns->total(),
                'has_more'     => $campaigns->hasMorePages(),
            ],
        ]);
    }

    /**
     * Show full campaign details including turns, avg rating and user's own rating.
     */
    public function show($campaignId)
    {
        try {
            $campaign = SharedCampaign::with([
                'gameSession',
                'sharedByUser:id,username',
            ])->withAvg('ratings', 'rating')
              ->withCount('ratings')
              ->findOrFail($campaignId);

            $turns = Turn::where('session_id', $campaign->session_id)
                ->where('is_resolved', true)
                ->orderBy('turn_number', 'asc')
                ->get();

            // Current user's own rating (if any)
            $userRating = null;
            if (Auth::check()) {
                $own = CampaignRating::where('campaign_id', $campaignId)
                    ->where('user_id', Auth::id())
                    ->first();
                $userRating = $own?->rating;
            }

            $session = $campaign->gameSession;
            $details = [
                'id'              => $campaign->id,
                'session_id'      => $session->id,
                'character_name'  => $session->character_name,
                'genre'           => $session->genre,
                'author'          => $campaign->sharedByUser->username,
                'current_health'  => $session->current_health,
                'max_health'      => $session->max_health,
                'current_mana'    => $session->current_mana,
                'max_mana'        => $session->max_mana,
                'turn_count'      => $session->turn_count,
                'max_turns'       => $session->max_turns,
                'outcome'         => $session->outcome,
                'shared_at'       => $campaign->shared_at->format('F j, Y'),
                'avg_rating'      => $campaign->ratings_avg_rating
                    ? round((float) $campaign->ratings_avg_rating, 1)
                    : null,
                'ratings_count'   => (int) $campaign->ratings_count,
                'user_rating'     => $userRating,
                'turns'           => $turns,
            ];

            return response()->json([
                'success'  => true,
                'campaign' => $details,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign not found.',
            ], 404);
        }
    }

    /**
     * Upsert (create or update) the authenticated user's rating for a campaign.
     */
    public function rateOrUpdate(Request $request, $campaignId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        SharedCampaign::findOrFail($campaignId);

        CampaignRating::updateOrCreate(
            ['campaign_id' => $campaignId, 'user_id' => Auth::id()],
            ['rating'      => $validated['rating']]
        );

        // Return fresh aggregates
        $avg   = CampaignRating::where('campaign_id', $campaignId)->avg('rating');
        $count = CampaignRating::where('campaign_id', $campaignId)->count();

        return response()->json([
            'success'       => true,
            'user_rating'   => $validated['rating'],
            'avg_rating'    => $avg ? round((float) $avg, 1) : null,
            'ratings_count' => (int) $count,
        ]);
    }

    /**
     * List comments for a campaign (paginated, newest first).
     */
    public function getComments(Request $request, $campaignId)
    {
        SharedCampaign::findOrFail($campaignId);

        $comments = CampaignComment::with('user:id,username')
            ->where('campaign_id', $campaignId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $formatted = $comments->map(function ($c) {
            return [
                'id'         => $c->id,
                'body'       => $c->body,
                'author'     => $c->user->username,
                'user_id'    => $c->user_id,
                'created_at' => $c->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'success'  => true,
            'comments' => $formatted,
            'pagination' => [
                'current_page' => $comments->currentPage(),
                'last_page'    => $comments->lastPage(),
                'total'        => $comments->total(),
                'has_more'     => $comments->hasMorePages(),
            ],
        ]);
    }

    /**
     * Add a comment to a campaign.
     */
    public function addComment(Request $request, $campaignId)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        SharedCampaign::findOrFail($campaignId);

        $comment = CampaignComment::create([
            'campaign_id' => $campaignId,
            'user_id'     => Auth::id(),
            'body'        => $validated['body'],
        ]);

        $comment->load('user:id,username');

        return response()->json([
            'success' => true,
            'comment' => [
                'id'         => $comment->id,
                'body'       => $comment->body,
                'author'     => $comment->user->username,
                'user_id'    => $comment->user_id,
                'created_at' => $comment->created_at->diffForHumans(),
            ],
        ], 201);
    }

    /**
     * Delete a comment — only the author may do so.
     */
    public function deleteComment($campaignId, $commentId)
    {
        $comment = CampaignComment::where('campaign_id', $campaignId)
            ->where('id', $commentId)
            ->firstOrFail();

        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden.',
            ], 403);
        }

        $comment->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Replay a community campaign as a new game session.
     */
    public function replay(Request $request, $campaignId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $validated = $request->validate([
            'character_name' => 'nullable|string|max:255',
        ]);

        try {
            return DB::transaction(function () use ($campaignId, $validated) {
                $campaign        = SharedCampaign::with('gameSession')->findOrFail($campaignId);
                $originalSession = $campaign->gameSession;

                GameSession::where('user_id', Auth::id())
                    ->where('status', 'active')
                    ->update(['status' => 'abandoned']);

                $charName = $validated['character_name'] ?: Auth::user()->username;

                $session = GameSession::create([
                    'user_id'        => Auth::id(),
                    'genre'          => $originalSession->genre,
                    'character_name' => $charName,
                    'current_health' => 100,
                    'max_health'     => 100,
                    'current_mana'   => 50,
                    'max_mana'       => 50,
                    'turn_count'     => 0,
                    'max_turns'      => $originalSession->max_turns,
                    'status'         => 'active',
                    'outcome'        => null,
                    'is_public'      => false,
                ]);

                $this->geminiService->giveStarterItems($session);

                return response()->json([
                    'success' => true,
                    'session' => $session,
                    'message' => 'Replay started successfully.',
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('LoreForge: Failed to start replay', [
                'user_id'     => Auth::id(),
                'campaign_id' => $campaignId,
                'error'       => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start replay.',
            ], 500);
        }
    }
}
