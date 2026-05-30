<?php

use App\Http\Controllers\Api\GameSessionController;
use App\Http\Controllers\Api\CommunityController;
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

Route::middleware(['web', 'auth', 'session.timeout'])
    ->prefix('game')
    ->group(function () {
    
    // Start a new game session
    Route::post('/start', [GameSessionController::class, 'start']);
    
    // Generate a new batch of turns for a session
    Route::post('/{sessionId}/generate-batch', [GameSessionController::class, 'generateBatch']);
    
    // Resolve a player's choice for a specific turn
    Route::post('/{sessionId}/resolve/{turnId}', [GameSessionController::class, 'resolveTurn']);
    
    // Get full session details for history timeline
    Route::get('/history/{sessionId}/details', [GameSessionController::class, 'getSessionDetails']);
    
    // Share / Unshare
    Route::post('/{sessionId}/share', [GameSessionController::class, 'share']);
    Route::delete('/{sessionId}/share', [GameSessionController::class, 'unshare']);
});

Route::middleware(['web', 'auth', 'session.timeout'])
    ->prefix('community')
    ->group(function () {
    Route::get('/', [CommunityController::class, 'index']);
    Route::get('/{campaignId}', [CommunityController::class, 'show']);
    Route::post('/{campaignId}/replay', [CommunityController::class, 'replay']);

    // Ratings
    Route::post('/{campaignId}/rate', [CommunityController::class, 'rateOrUpdate']);

    // Comments
    Route::get('/{campaignId}/comments', [CommunityController::class, 'getComments']);
    Route::post('/{campaignId}/comments', [CommunityController::class, 'addComment']);
    Route::delete('/{campaignId}/comments/{commentId}', [CommunityController::class, 'deleteComment']);
});
