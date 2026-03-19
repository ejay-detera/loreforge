<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail && !$user->hasVerifiedEmail(),
            'status' => session('status'),
            'mfaEnabled' => $user->two_factor_enabled,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        
        // Handle profile picture upload
        if ($request->hasFile('profile_url')) {
            $file = $request->file('profile_url');
            
            // Validate file
            $request->validate([
                'profile_url' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            ]);
            
            // Create unique filename
            $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store in public/profile directory
            $path = $file->storeAs('profile', $filename, 'public');
            
            // Update profile_url with the stored file path
            $user->profile_url = $path;
        }
        
        // Update other fields
        if (isset($validated['username'])) {
            $user->username = trim(strip_tags($validated['username']));
        }
        
        if (isset($validated['email'])) {
            $user->email = strtolower(trim($validated['email']));
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }
        }

        $user->save();

        return Redirect::route('user.profile')->with('status', 'profile-updated');
    }

        /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
