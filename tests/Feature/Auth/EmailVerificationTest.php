<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(200);
    }

    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        // Simulate OTP setup in session
        $otp = '123456';
        $token = \Illuminate\Support\Facades\Crypt::encrypt([
            'otp' => $otp,
            'timestamp' => now()->timestamp,
            'email' => $user->email
        ]);

        $response = $this->actingAs($user)
            ->withSession(['otp_token' => $token])
            ->post('/verify-email/otp', [
                'otp' => $otp,
            ]);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_email_is_not_verified_with_invalid_otp(): void
    {
        $user = User::factory()->unverified()->create();

        // Simulate OTP setup in session
        $otp = '123456';
        $token = \Illuminate\Support\Facades\Crypt::encrypt([
            'otp' => $otp,
            'timestamp' => now()->timestamp,
            'email' => $user->email
        ]);

        $response = $this->actingAs($user)
            ->withSession(['otp_token' => $token])
            ->post('/verify-email/otp', [
                'otp' => '654321', // wrong OTP
            ]);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        $response->assertSessionHasErrors('otp');
    }
}
