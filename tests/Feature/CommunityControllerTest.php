<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\SharedCampaign;
use App\Models\GameSession;
use App\Models\CampaignComment;

class CommunityControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_comment_sanitizes_body()
    {
        $user = User::factory()->create();
        $session = GameSession::factory()->create(['user_id' => $user->id, 'outcome' => 'victory', 'is_public' => true]);
        $campaign = SharedCampaign::factory()->create(['session_id' => $session->id, 'shared_by' => $user->id]);

        $response = $this->actingAs($user)->postJson("/api/community/{$campaign->id}/comments", [
            'body' => '<script>alert("xss")</script><b>Nice run!</b>',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('campaign_comments', [
            'campaign_id' => $campaign->id,
            'body' => 'alert("xss")Nice run!', // strip_tags removes the tags
        ]);
    }

    public function test_rate_limiting_on_comments()
    {
        $user = User::factory()->create();
        $session = GameSession::factory()->create(['user_id' => $user->id, 'outcome' => 'victory', 'is_public' => true]);
        $campaign = SharedCampaign::factory()->create(['session_id' => $session->id, 'shared_by' => $user->id]);

        // Make 30 requests
        for ($i = 0; $i < 30; $i++) {
            $this->actingAs($user)->postJson("/api/community/{$campaign->id}/comments", [
                'body' => "Comment $i",
            ]);
        }

        // 31st request should be rate limited
        $response = $this->actingAs($user)->postJson("/api/community/{$campaign->id}/comments", [
            'body' => "Too many",
        ]);

        $response->assertStatus(429);
    }
}
