<?php

namespace Database\Factories;

use App\Models\Bank;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BankFactory extends Factory
{
    protected $model = Bank::class;

    public function definition(): array
    {
        $accountTypes = ['savings','current','business','cash'];

        return [
            'name' => $this->faker->company() . ' Bank',
            'branch' => $this->faker->boolean(80) ? $this->faker->city() . ' Branch' : null,
            'account_number' => $this->faker->boolean(80) ? $this->faker->bankAccountNumber() : null,
            'ifsc_code' => $this->faker->boolean(80) ? strtoupper($this->faker->bothify('????0#####')) : null,
            'account_type' => $this->faker->randomElement($accountTypes),
            'is_active' => $this->faker->boolean(90),
            'created_by' => User::inRandomOrder()->first()->id ?? User::factory(),
            'updated_by' => User::inRandomOrder()->first()->id ?? User::factory(),
            'deleted_by' => null,
        ];
    }
}
