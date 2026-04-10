<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'budget_id', 'type', 'amount',
        'description', 'category', 'date',
        'is_recurring', 'recurring_frequency', 'recurring_end_date',
        'notes', 'attachment_path',
    ];

    protected $casts = [
        'amount'             => 'decimal:2',
        'date'               => 'date',
        'recurring_end_date' => 'date',
        'is_recurring'       => 'boolean',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopeForMonth($query, int $month, int $year)
    {
        return $query->whereMonth('date', $month)->whereYear('date', $year);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isIncome(): bool
    {
        return $this->type === 'income';
    }

    public function isExpense(): bool
    {
        return $this->type === 'expense';
    }

    /**
     * Montant signé : positif pour les revenus, négatif pour les dépenses.
     */
    public function signedAmount(): float
    {
        return $this->isIncome() ? (float) $this->amount : -(float) $this->amount;
    }
}
