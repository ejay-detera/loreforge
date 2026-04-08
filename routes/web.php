<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\MfaController;
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

// MFA Routes
Route::get('/mfa/setup', [MfaController::class, 'setup'])->middleware('auth')->name('mfa.setup');
Route::post('/mfa/enable', [MfaController::class, 'enable'])->middleware('auth')->name('mfa.enable');
Route::get('/mfa/verify', [MfaController::class, 'verify'])->middleware(['auth', 'prevent.mfa.back'])->name('mfa.verify');
Route::post('/mfa/check', [MfaController::class, 'check'])->middleware('auth')->name('mfa.check');
Route::post('/mfa/disable', [MfaController::class, 'disable'])->middleware('auth')->name('mfa.disable');
Route::post('/mfa/logout', [MfaController::class, 'logout'])->name('mfa.logout');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified', 'session.timeout', 'mfa'])->name('dashboard');

Route::middleware(['auth', 'session.timeout', 'mfa'])->group(function () {
    Route::get('/update-activity', function () {
        session(['last_activity' => now()]);
        return response()->json(['status' => 'success']);
    })->name('update.activity');
    
    // Game pages
    Route::get('/new-game', function () {
        return Inertia::render('NewGame');
    })->name('new-game');
    
    Route::get('/game', [GameController::class, 'show'])->name('game');
    
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
        // Return 401 without debug headers in production
        $response = response()->json(['status' => 'unauthenticated'], 401);
        
        // Only add debug headers in local/development environment
        if (app()->environment('local', 'testing')) {
            $response->header('X-Debug-Auth', 'false')
                     ->header('X-Session-ID', session()->getId());
        }
        
        return $response;
    }
})->middleware('web');

require __DIR__.'/auth.php';
