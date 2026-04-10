<?php

namespace App\Http\Controllers;

use App\Services\ForecastService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Tableau de bord Web (Inertia + React).
 * Utilise le même ForecastService que le contrôleur API mobile.
 */
class DashboardController extends Controller
{
    public function __construct(
        private readonly ForecastService $forecastService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $plan = $user->currentPlan();

        // Statistiques du mois courant
        $currentMonth = now()->month;
        $currentYear  = now()->year;

        $currentMonthTxs = $user->transactions()
            ->forMonth($currentMonth, $currentYear)
            ->get();

        $monthlyIncome = (float) $currentMonthTxs->where('type', 'income')->sum('amount');
        $monthlyExpenses = (float) $currentMonthTxs->where('type', 'expense')->sum('amount');

        $recentTransactions = $currentMonthTxs
            ->sortByDesc('date')
            ->take(5)
            ->values()
            ->toArray();

        $activeBudgets = $user->budgets()
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->get()
            ->map(fn ($b) => [
                'id'              => $b->id,
                'name'            => $b->name,
                'category'        => $b->category,
                'monthly_limit'   => $b->monthly_limit,
                'spent'           => $b->spentAmount(),
                'remaining'       => $b->remainingAmount(),
                'usage_percent'   => $b->usagePercentage(),
                'is_over_budget'  => $b->isOverBudget(),
                'color'           => $b->color,
            ]);

        $activeGoals = $user->savingsGoals()
            ->active()
            ->get()
            ->map(fn ($g) => [
                'id'               => $g->id,
                'name'             => $g->name,
                'target_amount'    => $g->target_amount,
                'current_amount'   => $g->current_amount,
                'progress'         => $g->progressPercentage(),
                'remaining'        => $g->remainingAmount(),
                'target_date'      => $g->target_date?->format('Y-m-d'),
                'monthly_saving'   => $g->requiredMonthlySaving(),
                'color'            => $g->color,
            ]);

        // 1. Tendances quotidiennes (mois en cours)
        $daysInMonth = now()->daysInMonth;
        $dailyTrends = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dateString = now()->startOfMonth()->addDays($i - 1)->format('Y-m-d');
            $dayTxs = $currentMonthTxs->filter(fn($tx) => $tx->date->format('Y-m-d') === $dateString);
            
            $dailyTrends[] = [
                'day' => $i,
                'Revenus' => round($dayTxs->where('type', 'income')->sum('amount'), 2),
                'Dépenses' => round($dayTxs->where('type', 'expense')->sum('amount'), 2),
            ];
        }

        // 2. Répartition par catégorie
        $categoriesMap = [
            'Alimentation' => '#f43f5e',
            'Logement' => '#3b82f6',
            'Transport' => '#eab308',
            'Santé' => '#10b981',
            'Loisirs' => '#a855f7',
            'Télécom' => '#8b5cf6',
            'Éducation' => '#f97316',
            'Vêtements' => '#ec4899',
            'Restauration' => '#f59e0b',
            'Voyages' => '#06b6d4',
            'Épargne' => '#6366f1',
            'Investissement' => '#14b8a6',
            'Autres' => '#94a3b8',
        ];

        $expensesByCategory = $currentMonthTxs->where('type', 'expense')
            ->groupBy('category')
            ->map(function ($group, $category) use ($categoriesMap) {
                return [
                    'name' => $category,
                    'value' => round($group->sum('amount'), 2),
                    'color' => $categoriesMap[$category] ?? '#94a3b8',
                ];
            })->sortByDesc('value')->values()->toArray();

        // 3. Tendances Mensuelles (6 derniers mois)
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            // on construit la requête mois par mois (les transactions du mois courant sont réutilisées, les anciennes requétées)
            $monthDate = now()->subMonths($i);
            $m = $monthDate->month;
            $y = $monthDate->year;
            $monthLabel = \Carbon\Carbon::create($y, $m, 1)->translatedFormat('M');

            if ($i === 0) {
                $inc = $monthlyIncome;
                $exp = $monthlyExpenses;
            } else {
                $txs = $user->transactions()->forMonth($m, $y)->get();
                $inc = $txs->where('type', 'income')->sum('amount');
                $exp = $txs->where('type', 'expense')->sum('amount');
            }

            $monthlyTrends[] = [
                'month' => ucfirst($monthLabel),
                'Revenus' => round($inc, 2),
                'Dépenses' => round($exp, 2),
            ];
        }

        // Prévisionnel : uniquement pour Premium
        $forecast = null;
        if ($plan->has_forecast) {
            $forecast = $this->forecastService->generate($user);
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'monthly_income'   => $monthlyIncome,
                'monthly_expenses' => $monthlyExpenses,
                'monthly_savings'  => $monthlyIncome - $monthlyExpenses,
                'balance'          => $monthlyIncome - $monthlyExpenses, // Normalement le solde global
            ],
            'charts' => [
                'daily_trends' => $dailyTrends,
                'monthly_trends' => $monthlyTrends,
                'expenses_by_category' => $expensesByCategory,
            ],
            'recent_transactions' => $recentTransactions,
            'budgets'             => $activeBudgets,
            'goals'               => $activeGoals,
            'forecast'            => $forecast,
            'plan'                => [
                'name'          => $plan->name,
                'slug'          => $plan->slug,
                'has_forecast'  => $plan->has_forecast,
                'has_recurring' => $plan->has_recurring,
                'max_goals'     => $plan->max_goals,
            ],
        ]);
    }
}
