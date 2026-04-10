<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // "Free", "Premium"
            $table->string('slug')->unique();                // "free", "premium"
            $table->decimal('price', 8, 2)->default(0.00);
            $table->string('billing_cycle')->default('monthly'); // monthly, yearly
            $table->integer('max_goals')->nullable();        // null = illimité
            $table->integer('max_transactions_per_month')->nullable();
            $table->integer('max_budgets')->nullable();
            $table->boolean('has_forecast')->default(false); // Prévisionnel 12 mois
            $table->boolean('has_recurring')->default(false);
            $table->json('features')->nullable();            // Liste de features pour l'UI
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
