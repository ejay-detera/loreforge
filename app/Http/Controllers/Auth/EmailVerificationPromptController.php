<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Crypt;
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

        Mail::to($user->email)->send(new OtpVerificationMail($otp, $user->username));
        return Inertia::render('Auth/VerifyEmail', ['status' => 'otp-sent']);
    }
}
