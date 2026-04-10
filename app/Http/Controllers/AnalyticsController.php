<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // S'il n'y a pas de paramètres, on prend le mois courant
        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);
        $targetDate = Carbon::create($year, $month, 1);

        $transactions = $user->transactions()
            ->forMonth($month, $year)
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');

        // Pie Data (Catégories)
        $categoryMap = [
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

        $pieData = $transactions->where('type', 'expense')
            ->groupBy('category')
            ->map(function ($group, $cat) use ($categoryMap) {
                return [
                    'name' => $cat,
                    'value' => round($group->sum('amount'), 2),
                    'color' => $categoryMap[$cat] ?? '#94a3b8'
                ];
            })->values()->sortByDesc('value')->values()->toArray();

        // Données quotidiennes
        $daysInMonth = $targetDate->daysInMonth;
        $dailyData = [];
        $highestDay = ['day' => null, 'amount' => 0];

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dateString = clone $targetDate;
            $dateString = $dateString->addDays($i - 1)->format('Y-m-d');
            
            $dayExp = $transactions->filter(fn($tx) => $tx->type === 'expense' && $tx->date->format('Y-m-d') === $dateString)->sum('amount');
            
            $amount = round($dayExp, 2);
            $dailyData[] = [
                'day' => $i,
                'date' => $dateString,
                'expenses' => $amount,
            ];

            if ($amount > $highestDay['amount']) {
                $highestDay = [
                    'day' => $dateString,
                    'amount' => $amount,
                ];
            }
        }

        return Inertia::render('Analytics/Index', [
            'month' => $month,
            'year' => $year,
            'monthLabel' => $targetDate->translatedFormat('F Y'),
            'stats' => [
                'income' => round($income, 2),
                'expense' => round($expense, 2),
                'net' => round($income - $expense, 2),
                'highestDay' => $highestDay,
            ],
            'chartPie' => $pieData,
            'chartDaily' => $dailyData
        ]);
    }
}
