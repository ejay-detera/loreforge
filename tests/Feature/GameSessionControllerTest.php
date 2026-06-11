<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\GameSession;
use App\Models\Turn;
use Illuminate\Support\Facades\DB;

class GameSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_start_session_requires_auth()
    {
        $response = $this->postJson('/api/game/start', [
            'genre' => 'fantasy',
            'character_name' => 'Hero',
        ]);
        $response->assertStatus(401);
    }

    public function test_start_session_creates_session_and_inventory()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/game/start', [
            'genre' => 'fantasy',
            'character_name' => 'Hero',
            'max_turns' => 20,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('game_sessions', [
            'user_id' => $user->id,
            'character_name' => 'Hero',
            'status' => 'active',
        ]);
        
        $this->assertDatabaseCount('inventory_items', 4); // 2x Health, 2x Mana
    }

    public function test_resolve_turn_handles_enemy_hp()
    {
        $user = User::factory()->create();
        $session = GameSession::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'enemy_current_hp' => 100,
            'turn_count' => 0,
        ]);

        $turn = Turn::factory()->create([
            'session_id' => $session->id,
            'is_resolved' => false,
            'outcomes' => [
                'attack' => [
                    'action_type' => 'attack',
                    'enemy_hp_change' => -20,
                    'health_change' => 0,
                    'mana_change' => 0,
                    'story' => 'You hit the enemy.',
                ]
            ],
        ]);

        $response = $this->actingAs($user)->postJson("/api/game/{$session->id}/resolve/{$turn->id}", [
            'choice' => 'attack',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('game_sessions', [
            'id' => $session->id,
            'enemy_current_hp' => 80,
            'turn_count' => 1,
        ]);
    }
}
