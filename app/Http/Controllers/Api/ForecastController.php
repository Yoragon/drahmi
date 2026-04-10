<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ForecastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoint API pour le tableau de bord prévisionnel (mobile).
 * Protégé par : auth:sanctum + plan.limit:forecast (Premium uniquement).
 *
 * GET /api/forecast → projection 12 mois en JSON
 */
class ForecastController extends Controller
{
    public function __construct(
        private readonly ForecastService $forecastService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // ForecastService est identique à celui appelé par le contrôleur Web.
        // Zéro duplication de logique métier.
        $forecast = $this->forecastService->generate($request->user());

        return response()->json($forecast);
    }
}
