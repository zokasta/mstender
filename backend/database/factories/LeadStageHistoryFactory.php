<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeadStageHistory>
 */
class LeadStageHistoryFactory extends Factory
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
            'from_stage_id' => null,
            'to_stage_id' => 1,
            'changed_by' => 1,
        ];
    }
}
