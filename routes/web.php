<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MfaController;

Route::get('/', function () {
    return view('welcome');
});

// MFA routes
Route::middleware('auth')->group(function () {
    Route::get('/mfa/setup', [MfaController::class, 'setup']);
    Route::post('/mfa/enable', [MfaController::class, 'enable']);
    Route::get('/mfa/verify', [MfaController::class, 'verify']);
    Route::post('/mfa/verify', [MfaController::class, 'check']);
});