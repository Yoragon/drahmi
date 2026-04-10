<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user  = $request->user();
        $month = (int) $request->input('month', now()->month);
        $year  = (int) $request->input('year', now()->year);

        $budgets = $user->budgets()
            ->where('month', $month)
            ->where('year', $year)
            ->get()
            ->map(fn (Budget $b) => [
                'id'            => $b->id,
                'name'          => $b->name,
                'category'      => $b->category,
                'monthly_limit' => $b->monthly_limit,
                'month'         => $b->month,
                'year'          => $b->year,
                'color'         => $b->color,
                'notes'         => $b->notes,
                'spent'         => $b->spentAmount(),
                'remaining'     => $b->remainingAmount(),
                'usage_percent' => $b->usagePercentage(),
                'is_over_budget'=> $b->isOverBudget(),
            ]);

        return Inertia::render('Budgets/Index', [
            'budgets'      => $budgets,
            'currentMonth' => $month,
            'currentYear'  => $year,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'category'      => ['required', 'string', 'max:100'],
            'monthly_limit' => ['required', 'numeric', 'min:0.01'],
            'month'         => ['required', 'integer', 'min:1', 'max:12'],
            'year'          => ['required', 'integer', 'min:2000'],
            'color'         => ['nullable', 'string', 'max:20'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]);

        $request->user()->budgets()->create($data);

        return Redirect::back()->with('success', 'Budget créé.');
    }

    public function update(Request $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'name'          => ['sometimes', 'string', 'max:255'],
            'category'      => ['sometimes', 'string', 'max:100'],
            'monthly_limit' => ['sometimes', 'numeric', 'min:0.01'],
            'month'         => ['sometimes', 'integer', 'min:1', 'max:12'],
            'year'          => ['sometimes', 'integer', 'min:2000'],
            'color'         => ['nullable', 'string', 'max:20'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]);

        $budget->update($data);

        return Redirect::back()->with('success', 'Budget mis à jour.');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);
        $budget->delete();

        return Redirect::back()->with('success', 'Budget supprimé.');
    }
}
