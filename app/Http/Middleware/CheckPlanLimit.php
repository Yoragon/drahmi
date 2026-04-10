<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware SaaS — Vérifie les limites du plan avant chaque action restreinte.
 *
 * Usage dans les routes :
 *   Route::post('/goals', ...)->middleware('plan.limit:goals');
 *   Route::post('/api/goals', ...)->middleware('plan.limit:goals');
 *
 * Paramètre : 'goals' | 'budgets' | 'forecast' | 'recurring'
 */
class CheckPlanLimit
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (! $user) {
            return $this->deny($request, 'Authentification requise.', 401);
        }

        $allowed = match ($feature) {
            'goals'     => $user->canCreateGoal(),
            'budgets'   => $user->canCreateBudget(),
            'forecast'  => $user->currentPlan()->has_forecast,
            'recurring' => $user->currentPlan()->has_recurring,
            default     => true,
        };

        if (! $allowed) {
            $message = $this->buildMessage($feature, $user->currentPlan()->slug);

            return $this->deny($request, $message, 403);
        }

        return $next($request);
    }

    private function buildMessage(string $feature, string $plan): string
    {
        return match ($feature) {
            'goals'    => "Limite d'objectifs atteinte. Passez au plan Premium pour en créer davantage.",
            'budgets'  => "Limite de budgets atteinte. Passez au plan Premium pour en créer davantage.",
            'forecast' => "Le tableau de bord prévisionnel est réservé au plan Premium.",
            'recurring'=> "Les transactions récurrentes sont réservées au plan Premium.",
            default    => "Fonctionnalité non disponible sur votre plan '{$plan}'.",
        };
    }

    private function deny(Request $request, string $message, int $status): Response
    {
        // Réponse JSON pour les routes API (mobile)
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message'  => $message,
                'upgrade'  => true,
                'plan_url' => route('subscription.upgrade'),
            ], $status);
        }

        // Réponse Inertia/web : redirect avec flash
        return redirect()->back()->with('error', $message)->with('upgrade', true);
    }
}
