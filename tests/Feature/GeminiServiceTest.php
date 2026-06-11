<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\GeminiService;
use App\Helpers\GameConstants;

class GeminiServiceTest extends TestCase
{
    public function test_get_enemy_tier_for_turn_returns_correct_tier()
    {
        // Use Reflection to access protected method
        $service = app(GeminiService::class);
        $reflection = new \ReflectionClass(GeminiService::class);
        $method = $reflection->getMethod('getEnemyTierForTurn');
        $method->setAccessible(true);

        // Turn 0/20 (ratio 0.0) -> WEAK
        $tier = $method->invoke($service, 0, 20);
        $this->assertEquals('WEAK', $tier);

        // Turn 5/20 (ratio 0.25) -> WEAK
        $tier = $method->invoke($service, 5, 20);
        $this->assertEquals('WEAK', $tier);

        // Turn 10/20 (ratio 0.5) -> MID
        $tier = $method->invoke($service, 10, 20);
        $this->assertEquals('MID', $tier);

        // Turn 16/20 (ratio 0.8) -> BOSS
        $tier = $method->invoke($service, 16, 20);
        $this->assertEquals('BOSS', $tier);
    }
}
