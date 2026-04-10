<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $plan = $user->currentPlan();

        $goals = $user->savingsGoals()
            ->orderBy('status')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (SavingsGoal $g) => [
                'id'             => $g->id,
                'name'           => $g->name,
                'target_amount'  => $g->target_amount,
                'current_amount' => $g->current_amount,
                'target_date'    => $g->target_date?->format('Y-m-d'),
                'status'         => $g->status,
                'color'          => $g->color,
                'icon'           => $g->icon,
                'notes'          => $g->notes,
                'progress'       => $g->progressPercentage(),
                'remaining'      => $g->remainingAmount(),
                'monthly_saving' => $g->requiredMonthlySaving(),
            ]);

        return Inertia::render('Goals/Index', [
            'goals'         => $goals,
            'plan'          => [
                'slug'      => $plan->slug,
                'max_goals' => $plan->max_goals,
            ],
            'canCreateGoal' => $user->canCreateGoal(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->canCreateGoal()) {
            return Redirect::back()->with('error', 'Limite d\'objectifs atteinte pour votre plan.');
        }

        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'target_amount'  => ['required', 'numeric', 'min:0.01'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'target_date'    => ['nullable', 'date', 'after:today'],
            'color'          => ['nullable', 'string', 'max:20'],
            'icon'           => ['nullable', 'string', 'max:10'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ]);

        $data['status']         = 'active';
        $data['current_amount'] = $data['current_amount'] ?? 0;

        $goal = $request->user()->savingsGoals()->create($data);

        if ((float) $goal->current_amount > 0) {
            $request->user()->transactions()->create([
                'type'        => 'expense',
                'amount'      => $goal->current_amount,
                'description' => 'Dépôt initial : ' . $goal->name,
                'category'    => 'Épargne',
                'date'        => now(),
            ]);
        }

        return Redirect::back()->with('success', 'Objectif créé.');
    }

    public function update(Request $request, SavingsGoal $goal): RedirectResponse
    {
        abort_unless($goal->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'name'           => ['sometimes', 'string', 'max:255'],
            'target_amount'  => ['sometimes', 'numeric', 'min:0.01'],
            'current_amount' => ['sometimes', 'numeric', 'min:0'],
            'target_date'    => ['nullable', 'date'],
            'color'          => ['nullable', 'string', 'max:20'],
            'icon'           => ['nullable', 'string', 'max:10'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ]);

        $oldAmount = (float) $goal->current_amount;
        $goal->update($data);
        $newAmount = (float) $goal->current_amount;

        $diff = $newAmount - $oldAmount;
        if (abs($diff) >= 0.01) {
            $type = $diff > 0 ? 'expense' : 'income';
            $prefix = $diff > 0 ? 'Ajustement (Ajout) : ' : 'Ajustement (Retrait) : ';
            
            $request->user()->transactions()->create([
                'type'        => $type,
                'amount'      => abs($diff),
                'description' => $prefix . $goal->name,
                'category'    => 'Épargne',
                'date'        => now(),
            ]);
        }

        // Auto-complete if target reached
        if ($newAmount >= (float) $goal->target_amount) {
            $goal->update(['status' => 'completed']);
        }

        return Redirect::back()->with('success', 'Objectif mis à jour.');
    }

    public function deposit(Request $request, SavingsGoal $goal): RedirectResponse
    {
        abort_unless($goal->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $depositAmount = (float) $data['amount'];
        $newAmount = (float) $goal->current_amount + $depositAmount;
        $goal->update(['current_amount' => $newAmount]);

        $request->user()->transactions()->create([
            'type'        => 'expense',
            'amount'      => $depositAmount,
            'description' => 'Dépôt : ' . $goal->name,
            'category'    => 'Épargne',
            'date'        => now(),
        ]);

        if ($newAmount >= (float) $goal->target_amount) {
            $goal->update(['status' => 'completed']);
        }

        return Redirect::back()->with('success', 'Dépôt effectué.');
    }

    public function complete(Request $request, SavingsGoal $goal): RedirectResponse
    {
        abort_unless($goal->user_id === $request->user()->id, 403);
        $goal->update(['status' => 'completed']);

        return Redirect::back()->with('success', 'Objectif marqué comme accompli.');
    }

    public function destroy(Request $request, SavingsGoal $goal): RedirectResponse
    {
        abort_unless($goal->user_id === $request->user()->id, 403);
        $goal->delete();

        return Redirect::back()->with('success', 'Objectif supprimé.');
    }
}
