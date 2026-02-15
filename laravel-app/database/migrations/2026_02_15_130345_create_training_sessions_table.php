<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('formation_id')->constrained('formations')->onDelete('cascade');
            $table->foreignUuid('trainer_id')->nullable()->constrained('formateurs')->onDelete('set null');
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->onDelete('cascade');
            $table->dateTime('date');
            $table->string('slot');
            $table->string('status')->default('PENDING');
            $table->text('location')->nullable();
            $table->json('logistics')->nullable();
            $table->boolean('is_logistics_open')->default(false);
            $table->json('participants')->nullable();
            $table->string('proof_url')->nullable();
            $table->dateTime('billed_at')->nullable();
            $table->json('billing_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
