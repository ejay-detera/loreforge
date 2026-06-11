<?php

namespace App\Services;

use App\Models\UserAchievement;
use App\Models\GameSession;
use Illuminate\Support\Facades\Log;

class AchievementService
{
    /**
     * Define the available achievements and their unlocking criteria.
     */
    const ACHIEVEMENTS = [
        'first_blood' => [
            'name' => 'First Blood',
            'description' => 'Survive your first encounter.',
            'icon' => 'fa-tint',
        ],
        'veteran' => [
            'name' => 'Veteran Explorer',
            'description' => 'Reach turn 10 in any adventure.',
            'icon' => 'fa-shield-alt',
        ],
        'master' => [
            'name' => 'Master Adventurer',
            'description' => 'Reach turn 20 in any adventure.',
            'icon' => 'fa-crown',
        ],
        'victorious' => [
            'name' => 'Victorious',
            'description' => 'Successfully complete an adventure.',
            'icon' => 'fa-trophy',
        ],
        'survivor' => [
            'name' => 'Barely Survived',
            'description' => 'Finish a turn with less than 20 HP.',
            'icon' => 'fa-heartbeat',
        ],
    ];

    /**
     * Evaluate a session state to see if any new achievements are unlocked.
     * Returns an array of newly unlocked achievement definitions.
     */
    public function evaluate(GameSession $session)
    {
        $unlockedNow = [];
        $userId = $session->user_id;

        $existing = UserAchievement::where('user_id', $userId)
            ->pluck('achievement_id')
            ->toArray();

        foreach (self::ACHIEVEMENTS as $id => $achievement) {
            if (in_array($id, $existing)) {
                continue;
            }

            if ($this->checkCriteria($id, $session)) {
                UserAchievement::create([
                    'user_id' => $userId,
                    'achievement_id' => $id,
                    'game_session_id' => $session->id,
                ]);

                $unlockedNow[] = array_merge(['id' => $id], $achievement);
            }
        }

        return $unlockedNow;
    }

    /**
     * Check if a specific achievement's criteria is met.
     */
    private function checkCriteria($achievementId, GameSession $session)
    {
        switch ($achievementId) {
            case 'first_blood':
                return $session->turn_count >= 1;
            case 'veteran':
                return $session->turn_count >= 10;
            case 'master':
                return $session->turn_count >= 20;
            case 'victorious':
                return $session->outcome === 'victory';
            case 'survivor':
                return $session->current_health > 0 && $session->current_health < 20;
            default:
                return false;
        }
    }
}
