<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;


class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        if (RateLimiter::tooManyAttempts('strict-auth:'.$request->ip(), 3)) {
            $seconds = RateLimiter::availableIn('strict-auth:'.$request->ip());
            return Inertia::render('Auth/Register', [
                'status' => "Access restricted. Too many failed attempts. Try again in " . ceil($seconds / 60) . " minutes.",
                'isBlocked' => true,
                'captcha_img' => ''

            ]);
        }

        return Inertia::render('Auth/Register', [
            'captcha_img' => \Mews\Captcha\Facades\Captcha::create('math', true)['img'],
        ]);
    }






    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check rate limiting
        if (RateLimiter::tooManyAttempts('strict-auth:'.$request->ip(), 3)) {
            $seconds = RateLimiter::availableIn('strict-auth:'.$request->ip());
            throw ValidationException::withMessages([
                'username' => "Access restricted. Too many failed attempts. Try again in " . ceil($seconds / 60) . " minutes.",
            ]);
        }

        // Sanitize and validate input
        $validated = $request->validate([
            'username' => 'required|string|max:255|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'captcha' => 'required|captcha',
        ], [
            'captcha.captcha' => 'The security check answer is incorrect. Please try again.',
            'captcha.required' => 'Please complete the security check.',
        ]);



        // Additional sanitization
        $sanitizedData = [
            'username' => trim(strip_tags($validated['username'])),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
        ];

        $user = User::create($sanitizedData);

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
