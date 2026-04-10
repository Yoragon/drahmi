<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingsGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'target_amount', 'current_amount',
        'target_date', 'status', 'color', 'icon', 'notes',
    ];

    protected $casts = [
        'target_amount'  => 'decimal:2',
        'current_amount' => 'decimal:2',
        'target_date'    => 'date',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function progressPercentage(): float
    {
        if ((float) $this->target_amount === 0.0) {
            return 0.0;
        }

        return min(100, ((float) $this->current_amount / (float) $this->target_amount) * 100);
    }

    public function remainingAmount(): float
    {
        return max(0, (float) $this->target_amount - (float) $this->current_amount);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed'
            || (float) $this->current_amount >= (float) $this->target_amount;
    }

    /**
     * Épargne mensuelle nécessaire pour atteindre l'objectif avant la date cible.
     * Retourne null si pas de date cible ou objectif déjà atteint.
     */
    public function requiredMonthlySaving(): ?float
    {
        if (! $this->target_date || $this->isCompleted()) {
            return null;
        }

        $monthsLeft = now()->diffInMonths($this->target_date);

        if ($monthsLeft <= 0) {
            return null;
        }

        return $this->remainingAmount() / $monthsLeft;
    }
}
