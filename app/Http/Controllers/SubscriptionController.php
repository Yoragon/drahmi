<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Change le plan de l'utilisateur connecté.
     * En prod, ici on intégrerait Stripe/Chargily.
     * Pour l'instant : changement direct en base (démo).
     */
    public function upgrade(Request $request): RedirectResponse
    {
        $request->validate([
            'plan' => ['required', 'string', 'exists:plans,slug'],
        ]);

        $user    = $request->user();
        $newPlan = Plan::where('slug', $request->plan)->firstOrFail();

        // Si déjà sur ce plan, on ne fait rien
        if ($user->currentPlan()->id === $newPlan->id) {
            return back()->with('info', 'Vous êtes déjà sur le plan ' . $newPlan->name . '.');
        }

        // Annuler l'abonnement actif existant
        $user->subscriptions()
             ->where('status', 'active')
             ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

        // Créer le nouvel abonnement
        $user->subscriptions()->create([
            'plan_id'   => $newPlan->id,
            'status'    => 'active',
            'starts_at' => now(),
        ]);

        $message = $newPlan->isFree()
            ? 'Vous êtes repassé au plan Free.'
            : 'Félicitations ! Vous êtes maintenant sur le plan ' . $newPlan->name . '.';

        return redirect()->route('dashboard')->with('success', $message);
    }
}
