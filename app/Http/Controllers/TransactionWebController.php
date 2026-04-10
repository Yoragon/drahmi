<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class TransactionWebController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'month'    => ['nullable', 'integer', 'min:1', 'max:12'],
            'year'     => ['nullable', 'integer', 'min:2000'],
            'type'     => ['nullable', 'in:income,expense'],
            'category' => ['nullable', 'string'],
        ]);

        $user  = $request->user();
        $query = $user->transactions()->with('budget')->latest('date');

        $month = $request->input('month', now()->month);
        $year  = $request->input('year', now()->year);

        $query->forMonth((int) $month, (int) $year);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $transactions = $query->paginate(20)->withQueryString();

        $budgets = $user->budgets()
            ->where('month', now()->month)
            ->where('year', now()->year)
            ->get(['id', 'name', 'category']);

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'budgets'      => $budgets,
            'filters'      => [
                'month'    => (int) $month,
                'year'     => (int) $year,
                'type'     => $request->type,
                'category' => $request->category,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type'                => ['required', 'in:income,expense'],
            'amount'              => ['required', 'numeric', 'min:0.01'],
            'description'         => ['required', 'string', 'max:255'],
            'category'            => ['required', 'string', 'max:100'],
            'date'                => ['required', 'date'],
            'budget_id'           => ['nullable', 'exists:budgets,id'],
            'is_recurring'        => ['boolean'],
            'recurring_frequency' => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'notes'               => ['nullable', 'string', 'max:1000'],
        ]);

        $request->user()->transactions()->create($data);

        return Redirect::back()->with('success', 'Transaction ajoutée.');
    }

    public function update(Request $request, \App\Models\Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'type'                => ['sometimes', 'in:income,expense'],
            'amount'              => ['sometimes', 'numeric', 'min:0.01'],
            'description'         => ['sometimes', 'string', 'max:255'],
            'category'            => ['sometimes', 'string', 'max:100'],
            'date'                => ['sometimes', 'date'],
            'budget_id'           => ['nullable', 'exists:budgets,id'],
            'is_recurring'        => ['sometimes', 'boolean'],
            'recurring_frequency' => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'notes'               => ['nullable', 'string', 'max:1000'],
        ]);

        $transaction->update($data);

        return Redirect::back()->with('success', 'Transaction mise à jour.');
    }

    public function destroy(Request $request, \App\Models\Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);
        $transaction->delete();

        return Redirect::back()->with('success', 'Transaction supprimée.');
    }
}
