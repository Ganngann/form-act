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
        Schema::create('formations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('title')->unique();
            $table->text('description');
            $table->string('level');
            $table->string('duration');
            $table->string('duration_type')->default('HALF_DAY');
            $table->string('program_link')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->text('methodology')->nullable();
            $table->text('inclusions')->nullable();
            $table->json('agreement_codes')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_expertise')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
