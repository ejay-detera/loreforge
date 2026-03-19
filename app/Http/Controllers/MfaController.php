<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Writer;
use BaconQrCode\Renderer\GDRenderer;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use Inertia\Inertia;
use Inertia\Response;

class MfaController extends Controller
{
    public function setup(): Response|RedirectResponse
    {
        // If user is not authenticated, redirect to login
        if (!auth()->check()) {
            return redirect()->route('login');
        }
        
        // If user already has MFA enabled, redirect to profile
        $user = auth()->user();
        if ($user->two_factor_enabled) {
            return redirect('/user-profile')->with('info', 'MFA is already enabled.');
        }
        
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        
        // Store secret temporarily in session with expiration
        session(['mfa_secret' => $secret, 'mfa_secret_expires' => now()->addMinutes(10)]);

        $appName = config('app.name', 'LoreForge');
        $email = auth()->user()->email;
        
        // Create QR code data for Google Authenticator
        $qrCodeData = "otpauth://totp/{$appName}:{$email}?secret={$secret}&issuer={$appName}";
        
        // Generate QR code locally using BaconQrCode
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new GDRenderer()
        );
        $writer = new Writer($renderer);
        $qrCodeImage = base64_encode($writer->writeString($qrCodeData));
        $qrCodeDataUrl = "data:image/png;base64,{$qrCodeImage}";

        return Inertia::render('Mfa/Setup', [
            'qrCodeUrl' => $qrCodeDataUrl,
            'secret' => $secret,
        ]);
    }

    public function enable(Request $Request)
    {
        $google2fa = new Google2FA();
        $secret = session('mfa_secret');
        $expires = session('mfa_secret_expires');

        // Check if secret has expired
        if (!$secret || !$expires || now()->isAfter($expires)) {
            session()->forget(['mfa_secret', 'mfa_secret_expires']);
            return back()->withErrors(['code' => 'Setup session expired. Please try again.']);
        }

        $valid = $google2fa->verifyKey($secret, $Request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid code. Please try again.']);
        }

        auth()->user()->update([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => true,
        ]);

        // Clear the temporary secret from session
        session()->forget(['mfa_secret', 'mfa_secret_expires']);

        return redirect('/user-profile')->with('success', 'MFA enabled successfully!');
    }

    public function verify(): Response|RedirectResponse
    {
        // If user is not authenticated, redirect to login
        if (!auth()->check()) {
            return redirect()->route('login');
        }
        
        // If user doesn't have MFA enabled, redirect to dashboard
        $user = auth()->user();
        if (!$user->two_factor_enabled) {
            return redirect()->route('dashboard');
        }
        
        // If MFA is already verified for this session, redirect to dashboard
        if (session('mfa_verified')) {
            return redirect()->route('dashboard');
        }
        
        return Inertia::render('Mfa/Verify');
    }

    public function check(Request $Request)
    {
        $google2fa = new Google2FA();
        $user = auth()->user();

        $valid = $google2fa->verifyKey($user->two_factor_secret, $Request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid code.']);
        }

        // Set MFA as verified for this session
        session(['mfa_verified' => true]);
        
        // Save the session to ensure persistence
        session()->save();
        
        return redirect()->intended('/dashboard');
    }

    public function disable(Request $Request)
    {
        $Request->validate([
            'password' => ['required', 'current_password'],
        ]);

        auth()->user()->update([
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
        ]);

        session()->forget('mfa_verified');
        
        return redirect('/user-profile')->with('success', 'MFA disabled successfully!');
    }

    public function logout()
    {
        auth()->logout();
        session()->invalidate();
        session()->regenerateToken();
        
        return redirect('/');
    }
}