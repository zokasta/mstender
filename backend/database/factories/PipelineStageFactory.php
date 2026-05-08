<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PipelineStage>
 */
class PipelineStageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pipeline_id' => 1,
            'name' => $this->faker->word(),
            'color' => $this->faker->hexColor(),
            'position' => $this->faker->numberBetween(1, 10),
            'is_default' => false,
        ];
    }
}
