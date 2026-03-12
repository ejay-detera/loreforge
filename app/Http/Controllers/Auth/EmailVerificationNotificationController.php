<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Crypt;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new OTP verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Check if OTP was already sent recently (rate limiting)
        if (session()->has('otp_sent_recently')) {
            return back()->with('status', 'otp-sent');
        }

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

        Mail::to($user->email)->send(new OtpVerificationMail($otp, $user->username));

        return back()->with('status', 'otp-sent');
    }
}
