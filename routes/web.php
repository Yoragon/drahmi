<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ForecastWebController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransactionWebController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes Web — FinanceTracker (Inertia + React)
|--------------------------------------------------------------------------
*/

// ─── Publiques ────────────────────────────────────────────────────────────────
Route::get('/', fn () => inertia('Welcome'))->name('home');

// ─── Authentifiées ────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Analyses
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

    // Transactions
    Route::get('/transactions',              [TransactionWebController::class, 'index'])->name('transactions.index');
    Route::post('/transactions',             [TransactionWebController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionWebController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionWebController::class, 'destroy'])->name('transactions.destroy');

    // Budgets
    Route::get('/budgets',              [BudgetController::class, 'index'])->name('budgets.index');
    Route::post('/budgets',             [BudgetController::class, 'store'])->name('budgets.store');
    Route::put('/budgets/{budget}',     [BudgetController::class, 'update'])->name('budgets.update');
    Route::delete('/budgets/{budget}',  [BudgetController::class, 'destroy'])->name('budgets.destroy');

    // Objectifs d'épargne
    Route::get('/goals',                        [GoalController::class, 'index'])->name('goals.index');
    Route::post('/goals',                       [GoalController::class, 'store'])->name('goals.store');
    Route::put('/goals/{goal}',                 [GoalController::class, 'update'])->name('goals.update');
    Route::post('/goals/{goal}/deposit',        [GoalController::class, 'deposit'])->name('goals.deposit');
    Route::patch('/goals/{goal}/complete',      [GoalController::class, 'complete'])->name('goals.complete');
    Route::delete('/goals/{goal}',              [GoalController::class, 'destroy'])->name('goals.destroy');

    // Prévisionnel
    Route::get('/forecast', [ForecastWebController::class, 'index'])->name('forecast.index');

    // Profil (requis par le layout Breeze)
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Paramètres
    Route::get('/settings', fn () => inertia('Settings/Index'))->name('settings');

    // Subscription
    Route::get('/subscription',          fn () => inertia('Subscription/Index'))->name('subscription.index');
    Route::get('/subscription/upgrade',  fn () => inertia('Subscription/Upgrade'))->name('subscription.upgrade');
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade'])->name('subscription.upgrade.post');
});

// ─── Breeze (auth routes) ─────────────────────────────────────────────────────
require __DIR__ . '/auth.php';
