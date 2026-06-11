<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\GameSession;

class CharacterController extends Controller
{
    /**
     * Get aggregated character data for the authenticated user.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        // Group by character_name and genre
        $characters = GameSession::select(
                'character_name as name',
                'genre',
                DB::raw('COUNT(*) as gamesPlayed'),
                DB::raw('SUM(CASE WHEN outcome = "victory" THEN 1 ELSE 0 END) as victories'),
                DB::raw('SUM(turn_count) as totalTurns'),
                DB::raw('MAX(created_at) as last_played')
            )
            ->where('user_id', $userId)
            ->groupBy('character_name', 'genre')
            ->orderBy('last_played', 'desc')
            ->get();

        // Assign an arbitrary ID since it's an aggregate
        $characters = $characters->map(function ($char, $index) {
            $char->id = $index + 1;
            $char->genre = ucfirst(strtolower($char->genre)); // Send Capitalized genre
            return $char;
        });

        return response()->json([
            'success' => true,
            'characters' => $characters
        ]);
    }
}
