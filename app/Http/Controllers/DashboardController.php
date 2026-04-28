<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\GameSession;
use App\Models\SharedCampaign;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Section 2: User Statistics from game_sessions
        $stats = $this->getUserStats($user);
        
        // Section 3: Recent game sessions
        $recentSessions = $this->getRecentSessions($user);
        
        // Section 4: Community spotlight campaigns
        $spotlightCampaigns = $this->getSpotlightCampaigns();
        
        // Last session info
        $lastSession = $this->getLastSession($user);
        
        return inertia('Dashboard', [
            'stats' => $stats,
            'recentSessions' => $recentSessions,
            'spotlightCampaigns' => $spotlightCampaigns,
            'lastSession' => $lastSession,
        ]);
    }
    
    private function getUserStats($user)
    {
        try {
            $totalGames = GameSession::where('user_id', $user->id)->count();
            $victories  = GameSession::where('user_id', $user->id)->where('outcome', 'victory')->count();
            $defeats    = GameSession::where('user_id', $user->id)->where('outcome', 'defeat')->count();
            
            $favGenre = GameSession::where('user_id', $user->id)
                ->selectRaw('genre, COUNT(*) as count')
                ->groupBy('genre')
                ->orderByDesc('count')
                ->first();
            
            return [
                'total'      => $totalGames,
                'victories'  => $victories,
                'defeats'    => $defeats,
                'favGenre'   => $favGenre ? ucfirst($favGenre->genre) : 'None',
            ];
        } catch (\Exception $e) {
            return [
                'total'     => 0,
                'victories' => 0,
                'defeats'   => 0,
                'favGenre'  => 'None',
            ];
        }
    }
    
    private function getRecentSessions($user)
    {
        try {
            return GameSession::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(4)
                ->get()
                ->map(function ($session) {
                    return [
                        'character' => $session->character_name ?? 'Unknown',
                        'genre'     => $this->formatGenre($session->genre ?? 'fantasy'),
                        'turns'     => $session->turn_count ?? 0,
                        'maxTurns'  => $session->max_turns ?? 20,
                        'outcome'   => $this->formatOutcome($session->outcome, $session->status),
                    ];
                });
        } catch (\Exception $e) {
            return [];
        }
    }
    
    private function getSpotlightCampaigns()
    {
        try {
            return SharedCampaign::with(['gameSession', 'sharedByUser'])
                ->latest('shared_at')
                ->take(3)
                ->get()
                ->map(function ($campaign) {
                    $session = $campaign->gameSession;

                    return [
                        'icon'        => $this->getGenreIcon($session->genre ?? 'fantasy'),
                        'name'        => ($session->character_name ?? 'Unknown') . "'s Adventure",
                        'author'      => $campaign->sharedByUser->username ?? 'Unknown',
                        'genre'       => $this->formatGenre($session->genre ?? 'fantasy'),
                        'turns'       => $session->turn_count ?? 0,
                        'outcome'     => $this->formatOutcome($session->outcome, $session->status),
                        'preview'     => $campaign->story_preview ?? '',
                        'accentColor' => $this->getGenreAccentColor($session->genre ?? 'fantasy'),
                    ];
                });
        } catch (\Exception $e) {
            return [];
        }
    }
    
    private function getLastSession($user)
    {
        try {
            $lastSession = GameSession::where('user_id', $user->id)
                ->latest()
                ->first();
            
            if ($lastSession) {
                return [
                    'id'     => $lastSession->id,
                    'genre'  => $this->formatGenre($lastSession->genre ?? 'fantasy'),
                    'turn'   => $lastSession->turn_count ?? 0,
                    'status' => $this->formatOutcome($lastSession->outcome, $lastSession->status),
                    'outcome'=> $lastSession->outcome ?? null,
                ];
            }
        } catch (\Exception $e) {
            // fall through to null
        }
        
        return null;
    }
    
    private function getGenreIcon($genre)
    {
        return [
            'fantasy' => 'fas fa-shield-alt',
            'scifi'   => 'fas fa-rocket',
            'horror'  => 'fas fa-eye',
        ][strtolower($genre)] ?? 'fas fa-shield-alt';
    }
    
    private function getGenreAccentColor($genre)
    {
        return [
            'fantasy' => '#C9A84C',
            'scifi'   => '#00BFFF',
            'horror'  => '#e05555',
        ][strtolower($genre)] ?? '#C9A84C';
    }

    private function formatGenre($genre)
    {
        return [
            'fantasy' => 'Fantasy',
            'scifi'   => 'Sci-Fi',
            'horror'  => 'Horror',
        ][strtolower($genre)] ?? 'Fantasy';
    }

    private function formatOutcome($outcome, $status = null)
    {
        if ($outcome === 'victory' || $status === 'victory') return 'Victory';
        if ($outcome === 'defeat' || $outcome === 'defeated' || $status === 'defeated') return 'Defeat';
        if ($status === 'abandoned') return 'Abandoned';
        
        return 'Active';
    }
}