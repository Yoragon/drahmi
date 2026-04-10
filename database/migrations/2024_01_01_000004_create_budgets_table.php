<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category');
            $table->decimal('monthly_limit', 12, 2);
            $table->unsignedTinyInteger('month');    // 1-12
            $table->unsignedSmallInteger('year');
            $table->string('color', 7)->default('#6366f1'); // Couleur hex pour l'UI
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'year', 'month']);
            // Un seul budget par catégorie par mois par user
            $table->unique(['user_id', 'category', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
