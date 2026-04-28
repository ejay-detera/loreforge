<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller

{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        // If user is already authenticated, check if they need MFA verification
        if (Auth::check()) {
            $user = Auth::user();
            
            // If user has MFA enabled but hasn't verified for this session
            if ($user && $user->two_factor_enabled && !session('mfa_verified')) {
                // Check if this is a fresh login attempt (no intended URL)
                $intendedUrl = session()->get('url.intended');
                if (!$intendedUrl || str_contains($intendedUrl, '/login')) {
                    // This looks like someone trying to access login while authenticated
                    // Redirect to dashboard instead of MFA verification
                    return redirect()->route('dashboard');
                }
                // Otherwise, they're trying to access a protected page, so require MFA
                return redirect()->route('mfa.verify');
            }
            
            // If already authenticated and MFA is not required or verified, redirect to dashboard
            return redirect()->route('dashboard');
        }
        
        // Check if IP is blocked
        if (RateLimiter::tooManyAttempts('strict-auth:'.$request->ip(), 3)) {
            $seconds = RateLimiter::availableIn('strict-auth:'.$request->ip());
            return Inertia::render('Auth/Login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => "Access restricted. Too many failed attempts. Try again in " . ceil($seconds / 60) . " minutes.",
                'isBlocked' => true,
            ]);
        }

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);

    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Sanitize and validate input
        $validated = $request->validated();

        // Additional sanitization for security
        $sanitizedData = [
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
            'remember' => $validated['remember'] ?? false,
        ];

        $request->authenticate();

        $request->session()->regenerate();

        // Check if user has MFA enabled
        $user = Auth::user();
        if ($user && $user->two_factor_enabled) {
            // Clear any existing MFA verification
            $request->session()->forget('mfa_verified');
            
            // Redirect to MFA verification instead of dashboard
            return redirect()->route('mfa.verify');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
