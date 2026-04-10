<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Plans SaaS ────────────────────────────────────────────────────────
        $free = Plan::create([
            'name'                       => 'Free',
            'slug'                       => 'free',
            'price'                      => 0.00,
            'billing_cycle'              => 'monthly',
            'max_goals'                  => 1,
            'max_transactions_per_month' => 50,
            'max_budgets'                => 3,
            'has_forecast'               => false,
            'has_recurring'              => false,
            'features'                   => [
                'Jusqu\'à 50 transactions/mois',
                '3 budgets mensuels',
                '1 objectif d\'épargne',
                'Historique 3 mois',
            ],
        ]);

        $premium = Plan::create([
            'name'                       => 'Premium',
            'slug'                       => 'premium',
            'price'                      => 9.99,
            'billing_cycle'              => 'monthly',
            'max_goals'                  => null,   // illimité
            'max_transactions_per_month' => null,   // illimité
            'max_budgets'                => null,   // illimité
            'has_forecast'               => true,
            'has_recurring'              => true,
            'features'                   => [
                'Transactions illimitées',
                'Budgets illimités',
                'Objectifs illimités',
                'Transactions récurrentes',
                'Prévisionnel 12 mois',
                'Export CSV/PDF',
                'Support prioritaire',
            ],
        ]);

        // ── Utilisateur de démo ────────────────────────────────────────────────
        $demoUser = User::create([
            'name'     => 'Demo User',
            'email'    => 'demo@financetracker.app',
            'password' => Hash::make('password'),
        ]);

        // Abonnement Free pour le compte démo
        $demoUser->subscriptions()->create([
            'plan_id'   => $free->id,
            'status'    => 'active',
            'starts_at' => now(),
        ]);

        // ── Utilisateur Premium de test ────────────────────────────────────────
        $premiumUser = User::create([
            'name'     => 'Premium User',
            'email'    => 'premium@financetracker.app',
            'password' => Hash::make('password'),
        ]);

        $premiumUser->subscriptions()->create([
            'plan_id'   => $premium->id,
            'status'    => 'active',
            'starts_at' => now(),
        ]);

        // Transactions de démo pour le prévisionnel
        $this->seedDemoTransactions($premiumUser);
    }

    private function seedDemoTransactions(User $user): void
    {
        // Revenus récurrents (salaire)
        $user->transactions()->create([
            'type'                => 'income',
            'amount'              => 2800.00,
            'description'         => 'Salaire',
            'category'            => 'Salaire',
            'date'                => now()->startOfMonth(),
            'is_recurring'        => true,
            'recurring_frequency' => 'monthly',
        ]);

        // Dépenses récurrentes
        foreach ([
            ['Loyer',          'Logement',     900.00],
            ['Abonnement Netflix', 'Loisirs',  15.99],
            ['Forfait mobile',  'Télécom',      25.00],
            ['Courses alimentaires', 'Alimentation', 350.00],
        ] as [$desc, $cat, $amount]) {
            $user->transactions()->create([
                'type'                => 'expense',
                'amount'              => $amount,
                'description'         => $desc,
                'category'            => $cat,
                'date'                => now()->startOfMonth(),
                'is_recurring'        => true,
                'recurring_frequency' => 'monthly',
            ]);
        }

        // Objectif d'épargne
        $user->savingsGoals()->create([
            'name'           => 'Vacances été',
            'target_amount'  => 2000.00,
            'current_amount' => 450.00,
            'target_date'    => now()->addMonths(5)->endOfMonth(),
            'status'         => 'active',
            'color'          => '#f59e0b',
            'icon'           => '✈️',
        ]);
    }
}
