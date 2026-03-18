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
                'favGenre'   => $favGenre ? ucfirst($favGenre->genre) : 'Fantasy',
            ];
        } catch (\Exception $e) {
            return [
                'total'     => 0,
                'victories' => 0,
                'defeats'   => 0,
                'favGenre'  => 'Fantasy',
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
                        'genre'     => ucfirst($session->genre ?? 'fantasy'),
                        'turns'     => $session->turn_count ?? 0,
                        'maxTurns'  => $session->max_turns ?? 20,
                        'outcome'   => ucfirst($session->outcome ?? 'In Progress'),
                    ];
                });
        } catch (\Exception $e) {
            return [];
        }
    }
    
    private function getSpotlightCampaigns()
    {
        try {
            return SharedCampaign::with(['session', 'sharedBy'])
                ->latest('shared_at')
                ->take(3)
                ->get()
                ->map(function ($campaign) {
                    $session = $campaign->session;

                    return [
                        'icon'        => $this->getGenreIcon($session->genre ?? 'fantasy'),
                        'name'        => $session->character_name . "'s Adventure" ?? 'Unknown Adventure',
                        'author'      => $campaign->sharedBy->username ?? 'Unknown',
                        'genre'       => ucfirst($session->genre ?? 'fantasy'),
                        'turns'       => $session->turn_count ?? 0,
                        'outcome'     => ucfirst($session->outcome ?? 'completed'),
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
                    'genre'  => ucfirst($lastSession->genre ?? 'fantasy'),
                    'turn'   => $lastSession->turn_count ?? 0,
                    'status' => $lastSession->status ?? 'active',
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
}