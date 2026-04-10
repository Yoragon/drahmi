<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'price', 'billing_cycle',
        'max_goals', 'max_transactions_per_month', 'max_budgets',
        'has_forecast', 'has_recurring', 'features', 'is_active',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'has_forecast'   => 'boolean',
        'has_recurring'  => 'boolean',
        'is_active'      => 'boolean',
        'features'       => 'array',
        'max_goals'      => 'integer',
        'max_transactions_per_month' => 'integer',
        'max_budgets'    => 'integer',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public static function free(): self
    {
        return static::where('slug', 'free')->firstOrFail();
    }

    public static function premium(): self
    {
        return static::where('slug', 'premium')->firstOrFail();
    }

    public function isFree(): bool
    {
        return $this->slug === 'free';
    }

    public function isPremium(): bool
    {
        return $this->slug === 'premium';
    }
}
