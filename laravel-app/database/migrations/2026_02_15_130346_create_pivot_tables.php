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
        Schema::create('formation_formateur', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('formation_id')->constrained('formations')->onDelete('cascade');
            $table->foreignUuid('formateur_id')->constrained('formateurs')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('expertise_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('formateur_id')->constrained('formateurs')->onDelete('cascade');
            $table->foreignUuid('zone_id')->constrained('zones')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('predilection_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('formateur_id')->constrained('formateurs')->onDelete('cascade');
            $table->foreignUuid('zone_id')->constrained('zones')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formation_formateur');
        Schema::dropIfExists('expertise_zones');
        Schema::dropIfExists('predilection_zones');
    }
};
