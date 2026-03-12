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

        return back()->with('status', 'otp-sent');
    }
}
