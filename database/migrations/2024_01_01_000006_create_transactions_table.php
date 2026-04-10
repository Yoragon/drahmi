<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('budget_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 12, 2);
            $table->string('description');
            $table->string('category');                      // "Alimentation", "Transport", etc.
            $table->date('date');

            // Récurrence
            $table->boolean('is_recurring')->default(false);
            $table->enum('recurring_frequency', ['daily', 'weekly', 'monthly', 'yearly'])
                  ->nullable();
            $table->date('recurring_end_date')->nullable();

            // Métadonnées
            $table->text('notes')->nullable();
            $table->string('attachment_path')->nullable();   // Reçu / facture
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'is_recurring']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
