<?php

namespace App\Http\Controllers;

use App\Services\ForecastService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForecastWebController extends Controller
{
    public function __construct(
        private readonly ForecastService $forecastService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $plan = $user->currentPlan();

        $forecast = null;
        if ($plan->has_forecast) {
            $forecast = $this->forecastService->generate($user);
        }

        return Inertia::render('Forecast/Index', [
            'forecast' => $forecast,
            'plan'     => [
                'slug'         => $plan->slug,
                'name'         => $plan->name,
                'has_forecast' => $plan->has_forecast,
            ],
        ]);
    }
}
