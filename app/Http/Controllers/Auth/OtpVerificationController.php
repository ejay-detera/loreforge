<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;

class OtpVerificationController extends Controller
{
    /**
     * Generate and send OTP for email verification
     */
    public function send(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

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

        return back()->with('status', 'otp-sent');
    }

    /**
     * Verify OTP code
     */
    public function verify(Request $request): RedirectResponse
    {
        // Sanitize and validate input
        $validated = $request->validate([
            'otp' => 'required|string|size:6|regex:/^[0-9]+$/',
        ]);

        $user = $request->user();
        
        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Get the stored token from session
        $token = session('otp_token');
        
        if (!$token) {
            return back()->withErrors(['otp' => 'Verification session expired. Please request a new code.']);
        }

        try {
            $data = Crypt::decrypt($token);
            
            // Check if token belongs to current user and hasn't expired (10 minutes)
            if ($data['email'] !== $user->email || now()->timestamp - $data['timestamp'] > 600) {
                session()->forget('otp_token');
                return back()->withErrors(['otp' => 'Verification code expired. Please request a new code.']);
            }

            // Verify OTP against sanitized input
            if ($validated['otp'] !== $data['otp']) {
                return back()->withErrors(['otp' => 'Invalid verification code.']);
            }

            // Mark email as verified
            $user->markEmailAsVerified();
            
            // Clear the session
            session()->forget('otp_token');
            session()->forget('otp_sent_recently');

            return redirect()->intended(route('dashboard', absolute: false))->with('status', 'verified');
            
        } catch (\Exception $e) {
            return back()->withErrors(['otp' => 'Invalid verification session. Please request a new code.']);
        }
    }
}
