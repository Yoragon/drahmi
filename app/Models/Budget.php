<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'category',
        'monthly_limit', 'month', 'year',
        'color', 'notes',
    ];

    protected $casts = [
        'monthly_limit' => 'decimal:2',
        'month'         => 'integer',
        'year'          => 'integer',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Montant total dépensé sur ce budget (transactions du même mois).
     */
    public function spentAmount(): float
    {
        return (float) $this->transactions()
            ->expense()
            ->whereMonth('date', $this->month)
            ->whereYear('date', $this->year)
            ->sum('amount');
    }

    /**
     * Montant restant disponible.
     */
    public function remainingAmount(): float
    {
        return (float) $this->monthly_limit - $this->spentAmount();
    }

    /**
     * Pourcentage d'utilisation du budget (0-100).
     */
    public function usagePercentage(): float
    {
        if ((float) $this->monthly_limit === 0.0) {
            return 0.0;
        }

        return min(100, ($this->spentAmount() / (float) $this->monthly_limit) * 100);
    }

    public function isOverBudget(): bool
    {
        return $this->remainingAmount() < 0;
    }
}
