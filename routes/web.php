<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\SessionTimeout;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/user-profile', [ProfileController::class, 'edit'])->middleware('auth')->name('user.profile');
Route::post('/user-profile', [ProfileController::class, 'update'])->middleware('auth')->name('user.profile.update');
Route::delete('/user-profile', [ProfileController::class, 'destroy'])->middleware('auth')->name('profile.destroy');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified', 'session.timeout'])->name('dashboard');

Route::middleware(['auth', 'session.timeout'])->group(function () {
    Route::get('/update-activity', function () {
        session(['last_activity' => now()]);
        return response()->json(['status' => 'success']);
    })->name('update.activity');
    
    // Game pages
    Route::get('/new-game', function () {
        return Inertia::render('NewGame');
    })->name('new-game');
    
    Route::get('/history', function () {
        return Inertia::render('History');
    })->name('history');
    
    Route::get('/community', function () {
        return Inertia::render('Community');
    })->name('community');
});

// Auth check endpoint for back button prevention
Route::get('/auth/check', function () {
    // Check if user is authenticated (session exists after migrate:fresh)
    if (auth()->check()) {
        return response()->json(['status' => 'authenticated']);
    } else {
        // Return 401 but with proper headers for debugging
        return response()->json(['status' => 'unauthenticated'], 401)
            ->header('X-Debug-Auth', 'false')
            ->header('X-Session-ID', session()->getId());
    }
})->middleware('web');

require __DIR__.'/auth.php';
