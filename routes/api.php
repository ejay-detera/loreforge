<?php

use App\Http\Controllers\Api\GameSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['web'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
    ->prefix('game')
    ->group(function () {
    
    // Start a new game session
    Route::post('/start', [GameSessionController::class, 'start']);
    
    // Generate a new batch of turns for a session
    Route::post('/{sessionId}/generate-batch', [GameSessionController::class, 'generateBatch']);
    
    // Resolve a player's choice for a specific turn
    Route::post('/{sessionId}/resolve/{turnId}', [GameSessionController::class, 'resolveTurn']);
    
});
