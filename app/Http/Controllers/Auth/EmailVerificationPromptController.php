<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt and automatically send OTP.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // If redirecting back with a status from another controller, use that status directly
        if (session('status')) {
            return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
        }

        // Check if OTP was already sent in this session (prevent multiple sends)
        if (session()->has('otp_sent_recently')) {
            return Inertia::render('Auth/VerifyEmail', ['status' => 'otp-sent']);
        }

        // Automatically send OTP
        $user = $request->user();
        
        // Generate numeric OTP (6 digits only)
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Encrypt the OTP and timestamp for verification
        $token = Crypt::encrypt([
            'otp' => $otp,
            'timestamp' => now()->timestamp,
            'email' => $user->email
        ]);

        // Store token in session for verification
        session(['otp_token' => $token]);
        
        // Mark that OTP was sent recently (prevent multiple sends for 2 minutes)
        session(['otp_sent_recently' => true]);

        try {
            Mail::to($user->email)->send(new OtpVerificationMail($otp, $user->username));
            return Inertia::render('Auth/VerifyEmail', ['status' => 'otp-sent']);
        } catch (\Throwable $e) {
            session()->forget('otp_sent_recently');

            Log::error('LoreForge: Failed to send verification OTP', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return Inertia::render('Auth/VerifyEmail', ['status' => 'otp-send-failed']);
        }
    }
}
