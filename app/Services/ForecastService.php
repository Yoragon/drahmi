<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * ForecastService — Moteur de projection financière Intelligent.
 * 
 * Ce service analyse à la fois les transactions "dures" (récurrentes)
 * ET les habitudes de dépenses variables de l'utilisateur (via une moyenne
 * pondérée des 3 derniers mois) pour projeter un avenir réaliste.
 */
class ForecastService
{
    /**
     * Génère la projection financière complète avec IA/Insights statiques.
     */
    public function generate(User $user): array
    {
        $currentBalance = $this->calculateCurrentBalance($user);
        $recurringTx    = $this->getActiveRecurringTransactions($user);
        $budgets        = $this->getBudgetsIndexedByCategory($user);
        
        // 1. Apprentissage: Moyennes des dépenses variables passées
        $averages       = $this->getCategoryAverages($user);

        $months            = [];
        $cumulativeBalance = $currentBalance;

        for ($i = 1; $i <= 12; $i++) {
            $targetDate = now()->addMonths($i);
            $monthData  = $this->projectMonth(
                month: $targetDate->month,
                year: $targetDate->year,
                recurringTx: $recurringTx,
                budgets: $budgets,
                averages: $averages
            );

            $cumulativeBalance += $monthData['projected_income'] - $monthData['projected_expenses'];

            $months[] = [
                'month'             => $targetDate->month,
                'year'              => $targetDate->year,
                'label'             => $targetDate->translatedFormat('M Y'),
                'projected_income'  => round($monthData['projected_income'], 2),
                'projected_expenses'=> round($monthData['projected_expenses'], 2),
                'net'               => round($monthData['projected_income'] - $monthData['projected_expenses'], 2),
                'cumulative_balance'=> round($cumulativeBalance, 2),
                'budget_alerts'     => $monthData['budget_alerts'],
            ];
        }

        // 2. Génération d'un résumé intelligent
        $summary = $this->buildSummary($months, $currentBalance);
        
        // 3. IA Insights: Génération de texte
        $insights = $this->generateInsights($averages, $months, $currentBalance);

        return [
            'current_balance' => round($currentBalance, 2),
            'months'          => $months,
            'summary'         => $summary,
            'insights'        => $insights
        ];
    }

    // ─── Phase Apprentissage: Dépenses Variables (3 mois) ────────────────────

    private function getCategoryAverages(User $user): array
    {
        // On analyse les 3 derniers mois glissants
        $startDate = now()->subMonths(3)->startOfDay();
        
        $transactions = $user->transactions()
            ->where('is_recurring', false)
            ->where('date', '>=', $startDate)
            ->where('date', '<=', now())
            // On ignore l'épargne forcée des objectifs pour ne pas fausser les dépenses courantes
            ->where('category', '!=', 'Épargne') 
            ->get();

        $averages = ['income' => [], 'expense' => []];

        $transactions->groupBy('type')->each(function ($typeGroup, $type) use (&$averages) {
            $typeGroup->groupBy('category')->each(function ($catGroup, $cat) use ($type, &$averages) {
                // Moyenne mensuelle sur une base de 3 mois
                $total = $catGroup->sum('amount');
                $averages[$type][$cat] = round($total / 3, 2);
            });
        });

        return $averages;
    }

    private function generateInsights(array $averages, array $months, float $currentBalance): array
    {
        $insights = [];
        
        $totalVarExpenses = array_sum($averages['expense']);
        if ($totalVarExpenses > 0) {
            $insights[] = "L'algorithme a détecté que vous dépensez en moyenne " . round($totalVarExpenses) . " de frais variables chaque mois. Ce montant a été inclus dans votre prévisionnel.";
        }

        if (!empty($averages['expense'])) {
            arsort($averages['expense']);
            $topCat = array_key_first($averages['expense']);
            $insights[] = "💡 <b>Point d'alerte</b> : Votre plus gros pôle de dépense non récurrent est \"{$topCat}\" (~" . round($averages['expense'][$topCat]) . "/mois). Le surveiller permettra d'améliorer considérablement vos prévisions.";
        }

        $finalMonth = end($months);
        if ($finalMonth && $finalMonth['cumulative_balance'] < 0) {
            $insights[] = "⚠️ <b>Alerte Danger</b> : En combinant vos charges fixes et vos habitudes variables, votre solde risque d'être négatif d'ici la fin de l'année. Pensez à limiter vos dépenses variables.";
        } else if ($finalMonth && $finalMonth['cumulative_balance'] > $currentBalance) {
            $insights[] = "✅ <b>Excellente santé financière</b> : Vos habitudes actuelles démontrent une rentabilité (Revenus > Dépenses). Votre capital devrait fructifier sereinement !";
        }

        return $insights;
    }

    // ─── Méthodes Classiques ────────────────────────────────────────────────

    private function calculateCurrentBalance(User $user): float
    {
        $totalIncome = (float) $user->transactions()->income()->where('date', '<=', today())->sum('amount');
        $totalExpenses = (float) $user->transactions()->expense()->where('date', '<=', today())->sum('amount');
        return $totalIncome - $totalExpenses;
    }

    private function getActiveRecurringTransactions(User $user): Collection
    {
        return $user->transactions()
            ->recurring()
            ->where(function ($query) {
                $query->whereNull('recurring_end_date')
                      ->orWhere('recurring_end_date', '>', today());
            })
            ->get();
    }

    private function getBudgetsIndexedByCategory(User $user): array
    {
        return $user->budgets()
            ->where('month', now()->month)
            ->where('year', now()->year)
            ->get()
            ->keyBy('category')
            ->map(fn (Budget $b) => (float) $b->monthly_limit)
            ->toArray();
    }

    private function projectMonth(int $month, int $year, Collection $recurringTx, array $budgets, array $averages): array 
    {
        $targetDate   = Carbon::create($year, $month, 1);
        $projectedIncome    = 0.0;
        $projectedExpenses  = 0.0;
        $budgetAlerts       = [];
        $expensesByCategory = [];

        // 1. Ajouter les transactions récurrentes DURES
        foreach ($recurringTx as $tx) {
            if (! $this->occursInMonth($tx, $month, $year)) continue;
            
            $amount = (float) $tx->amount;
            if ($tx->isIncome()) {
                $projectedIncome += $amount;
            } else {
                $projectedExpenses += $amount;
                $expensesByCategory[$tx->category] = ($expensesByCategory[$tx->category] ?? 0.0) + $amount;
            }
        }

        // 2. Ajouter les moyennes variables INTELLIGENTES
        foreach ($averages['income'] as $cat => $amount) {
            $projectedIncome += $amount;
        }
        foreach ($averages['expense'] as $cat => $amount) {
            // Si la catégorie récurrente a déjà été comptée, on l'ajoute quand même car ce sont des dépenses "variables" en plus
            $projectedExpenses += $amount;
            $expensesByCategory[$cat] = ($expensesByCategory[$cat] ?? 0.0) + $amount;
        }

        // Vérification des dépassements de budget O(1)
        foreach ($expensesByCategory as $category => $expense) {
            if (isset($budgets[$category]) && $expense > $budgets[$category]) {
                $overage = round($expense - $budgets[$category], 2);
                $budgetAlerts[] = "Budget '{$category}' dépassé de {$overage} en " . $targetDate->translatedFormat('M Y');
            }
        }

        return [
            'projected_income'   => $projectedIncome,
            'projected_expenses' => $projectedExpenses,
            'budget_alerts'      => $budgetAlerts,
        ];
    }

    private function occursInMonth(Transaction $tx, int $month, int $year): bool
    {
        $targetDate = Carbon::create($year, $month, 1);
        $txStart    = Carbon::parse($tx->date);

        if ($targetDate->lt($txStart->startOfMonth())) return false;
        if ($tx->recurring_end_date && $targetDate->gt(Carbon::parse($tx->recurring_end_date))) return false;

        return match ($tx->recurring_frequency) {
            'monthly' => true,
            'yearly'  => $txStart->month === $month,
            'weekly'  => true, 
            'daily'   => true,
            default   => false,
        };
    }

    private function buildSummary(array $months, float $currentBalance): array
    {
        $finalBalance   = end($months)['cumulative_balance'] ?? $currentBalance;
        $totalIncome    = array_sum(array_column($months, 'projected_income'));
        $totalExpenses  = array_sum(array_column($months, 'projected_expenses'));
        $allAlerts      = array_merge(...array_column($months, 'budget_alerts'));

        return [
            'current_balance'         => round($currentBalance, 2),
            'projected_balance_12m'   => round($finalBalance, 2),
            'total_projected_income'  => round($totalIncome, 2),
            'total_projected_expenses'=> round($totalExpenses, 2),
            'net_over_12_months'      => round($totalIncome - $totalExpenses, 2),
            'budget_alerts_count'     => count($allAlerts),
            'trend'                   => $finalBalance > $currentBalance ? 'positive' : 'negative',
        ];
    }
}
