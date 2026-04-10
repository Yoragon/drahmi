<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
                    ->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
                    })
                    ->latestOfMany();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    public function savingsGoals(): HasMany
    {
        return $this->hasMany(SavingsGoal::class);
    }

    // ─── Helpers Plan / SaaS ─────────────────────────────────────────────────

    /**
     * Retourne le plan actif de l'utilisateur.
     * Si aucun abonnement actif, retourne le plan Free par défaut.
     */
    public function currentPlan(): Plan
    {
        $subscription = $this->activeSubscription;

        return $subscription ? $subscription->plan : Plan::free();
    }

    public function isOnPlan(string $slug): bool
    {
        return $this->currentPlan()->slug === $slug;
    }

    public function isPremium(): bool
    {
        return $this->isOnPlan('premium');
    }

    /**
     * Vérifie si l'utilisateur peut créer un nouvel objectif d'épargne
     * selon les limites de son plan.
     */
    public function canCreateGoal(): bool
    {
        $plan = $this->currentPlan();

        // null = illimité (Premium)
        if ($plan->max_goals === null) {
            return true;
        }

        return $this->savingsGoals()->where('status', 'active')->count() < $plan->max_goals;
    }

    /**
     * Vérifie si l'utilisateur peut créer un budget ce mois-ci.
     */
    public function canCreateBudget(): bool
    {
        $plan = $this->currentPlan();

        if ($plan->max_budgets === null) {
            return true;
        }

        $currentMonthCount = $this->budgets()
            ->where('month', now()->month)
            ->where('year', now()->year)
            ->count();

        return $currentMonthCount < $plan->max_budgets;
    }
}
