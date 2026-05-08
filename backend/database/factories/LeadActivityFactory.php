<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeadActivity>
 */
class LeadActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lead_id' => 1,
            'activity_type_id' => 1,
            'description' => $this->faker->sentence(),
            'activity_time' => now(),
            'created_by' => 1,
        ];
    }
}
