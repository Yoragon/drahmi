<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API — FinanceTracker
|--------------------------------------------------------------------------
*/

// ─── Authentification (publique) ──────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// ─── Routes protégées par Sanctum ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    Route::apiResource('transactions', TransactionController::class);

    Route::get('/forecast', [ForecastController::class, 'index'])
         ->middleware('plan.limit:forecast');
});
