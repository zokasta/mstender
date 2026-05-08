<?php

namespace Database\Factories;

use App\Models\Tax;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaxFactory extends Factory
{
    protected $model = Tax::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' Tax',
            'code' => strtoupper($this->faker->unique()->lexify('???')) . $this->faker->numberBetween(1, 99),
            'rate' => $this->faker->randomFloat(2, 1, 30),
            'description' => $this->faker->sentence(),
            'is_active' => $this->faker->boolean(90),
            'created_by' => User::inRandomOrder()->first()->id ?? User::factory(),
            'updated_by' => User::inRandomOrder()->first()->id ?? User::factory(),
            'deleted_by' => null,
        ];
    }
}
