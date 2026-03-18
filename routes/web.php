<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
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

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
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
