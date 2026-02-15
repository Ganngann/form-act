<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Formation>
 */
class FormationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(),
            'description' => fake()->paragraph(),
            'level' => 'Beginner',
            'duration' => '4h',
            'duration_type' => 'HALF_DAY',
            'is_published' => true,
        ];
    }
}
