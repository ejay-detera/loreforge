<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PragmaRX\Google2FA\Google2FA;

class MfaController extends Controller
{
    public function setup()
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        
        session(['mfa_secret' => $secret]);

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            auth()->user()->email,
            $secret
        );

        return view('mfa.setup', compact('qrCodeUrl', 'secret'));
    }

    public function enable(Request $request)
    {
        $google2fa = new Google2FA();
        $secret = session('mfa_secret');

        $valid = $google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid code. Please try again.']);
        }

        auth()->user()->update([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => true,
        ]);

        return redirect('/dashboard')->with('success', 'MFA enabled!');
    }

    public function verify()
    {
        return view('mfa.verify');
    }

    public function check(Request $request)
    {
        $google2fa = new Google2FA();
        $user = auth()->user();

        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid code.']);
        }

        session(['mfa_verified' => true]);
        return redirect()->intended('/dashboard');
    }
}