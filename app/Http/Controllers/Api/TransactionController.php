<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * CRUD des transactions via l'API mobile (JSON pur).
 * Toutes les routes sont protégées par Sanctum (auth:sanctum).
 */
class TransactionController extends Controller
{
    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'month'    => ['nullable', 'integer', 'min:1', 'max:12'],
            'year'     => ['nullable', 'integer', 'min:2000'],
            'type'     => ['nullable', Rule::in(['income', 'expense'])],
            'category' => ['nullable', 'string'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $query = $request->user()->transactions()->latest('date');

        if ($request->filled('month') && $request->filled('year')) {
            $query->forMonth($request->month, $request->year);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $transactions = $query->paginate($request->input('per_page', 20));

        return response()->json($transactions);
    }

    // ─── Store ────────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'                => ['required', Rule::in(['income', 'expense'])],
            'amount'              => ['required', 'numeric', 'min:0.01'],
            'description'         => ['required', 'string', 'max:255'],
            'category'            => ['required', 'string', 'max:100'],
            'date'                => ['required', 'date'],
            'budget_id'           => ['nullable', 'exists:budgets,id'],
            'is_recurring'        => ['boolean'],
            'recurring_frequency' => [
                'required_if:is_recurring,true',
                Rule::in(['daily', 'weekly', 'monthly', 'yearly']),
                'nullable',
            ],
            'recurring_end_date'  => ['nullable', 'date', 'after:date'],
            'notes'               => ['nullable', 'string', 'max:1000'],
        ]);

        // Le middleware plan.limit:recurring bloque déjà si pas Premium
        // mais on vérifie aussi ici par sécurité
        if (($data['is_recurring'] ?? false) && ! $request->user()->currentPlan()->has_recurring) {
            return response()->json([
                'message' => 'Les transactions récurrentes sont réservées au plan Premium.',
                'upgrade' => true,
            ], 403);
        }

        $transaction = $request->user()->transactions()->create($data);

        return response()->json($transaction, 201);
    }

    // ─── Show ─────────────────────────────────────────────────────────────────

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorizeResource($request, $transaction);

        return response()->json($transaction->load('budget'));
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorizeResource($request, $transaction);

        $data = $request->validate([
            'type'                => ['sometimes', Rule::in(['income', 'expense'])],
            'amount'              => ['sometimes', 'numeric', 'min:0.01'],
            'description'         => ['sometimes', 'string', 'max:255'],
            'category'            => ['sometimes', 'string', 'max:100'],
            'date'                => ['sometimes', 'date'],
            'budget_id'           => ['nullable', 'exists:budgets,id'],
            'is_recurring'        => ['sometimes', 'boolean'],
            'recurring_frequency' => ['nullable', Rule::in(['daily', 'weekly', 'monthly', 'yearly'])],
            'recurring_end_date'  => ['nullable', 'date'],
            'notes'               => ['nullable', 'string', 'max:1000'],
        ]);

        $transaction->update($data);

        return response()->json($transaction);
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorizeResource($request, $transaction);

        $transaction->delete();

        return response()->json(null, 204);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function authorizeResource(Request $request, Transaction $transaction): void
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403, 'Action non autorisée.');
        }
    }
}
