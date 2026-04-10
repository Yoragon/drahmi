<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Gestion de l'authentification mobile via Sanctum (tokens API).
 *
 * Endpoints :
 *   POST /api/auth/login    → retourne un token Bearer
 *   POST /api/auth/register → crée un compte + retourne un token
 *   POST /api/auth/logout   → révoque le token courant
 *   GET  /api/auth/me       → infos utilisateur + plan actif
 */
class AuthController extends Controller
{
    // ─── Login ────────────────────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'       => ['required', 'email'],
            'password'    => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Ces identifiants ne correspondent à aucun compte.'],
            ]);
        }

        // Révoque les anciens tokens du même appareil pour éviter la prolifération
        $user->tokens()->where('name', $request->device_name)->delete();

        $token = $user->createToken(
            name: $request->device_name,
            abilities: ['*'],
            expiresAt: now()->addDays(30),
        );

        return response()->json([
            'token'      => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user'       => $this->formatUser($user),
        ]);
    }

    // ─── Register ─────────────────────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'password'    => ['required', 'confirmed', Password::defaults()],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Attribuer automatiquement le plan Free à l'inscription
        $freePlan = \App\Models\Plan::free();
        $user->subscriptions()->create([
            'plan_id'    => $freePlan->id,
            'status'     => 'active',
            'starts_at'  => now(),
        ]);

        $token = $user->createToken(
            name: $request->device_name,
            abilities: ['*'],
            expiresAt: now()->addDays(30),
        );

        return response()->json([
            'token'      => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user'       => $this->formatUser($user),
        ], 201);
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        // Révoque uniquement le token utilisé pour cette requête
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    // ─── Me ───────────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('activeSubscription.plan');

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        $plan = $user->currentPlan();

        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'created_at' => $user->created_at,
            'plan'       => [
                'name'          => $plan->name,
                'slug'          => $plan->slug,
                'has_forecast'  => $plan->has_forecast,
                'has_recurring' => $plan->has_recurring,
                'max_goals'     => $plan->max_goals,
            ],
        ];
    }
}
