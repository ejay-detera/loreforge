<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserAchievement;
use App\Services\AchievementService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AchievementController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // Get all unlocked achievements for the user
        $unlockedRecords = UserAchievement::with('gameSession')
            ->where('user_id', $userId)
            ->get()
            ->keyBy('achievement_id');

        // Build the full list of achievements
        $achievementsList = [];
        
        foreach (AchievementService::ACHIEVEMENTS as $id => $details) {
            $unlocked = $unlockedRecords->has($id);
            $record = $unlocked ? $unlockedRecords->get($id) : null;
            
            $gameContext = null;
            if ($record && $record->gameSession) {
                $characterName = $record->gameSession->character_name ?? 'Unknown';
                $gameContext = "Unlocked in {$characterName}'s Legend";
            }

            $achievementsList[] = [
                'id' => $id,
                'name' => $details['name'],
                'description' => $details['description'],
                'icon' => $details['icon'],
                'unlocked' => $unlocked,
                'unlocked_at' => $record ? $record->created_at->format('Y-m-d') : null,
                'game_context' => $gameContext,
            ];
        }

        return Inertia::render('Achievements', [
            'achievements' => $achievementsList,
        ]);
    }
}
