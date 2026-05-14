<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Group;
use App\Models\Pickup;
use Illuminate\Database\Eloquent\Factories\Factory;


class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition()
    {
        // choose a group if exists else null (test seed should create groups first)

        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'dob' => $this->faker->date('Y-m-d', '-18 years'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'phone' => $this->faker->numerify('9#########'),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'cancelled']),
            'remark' => $this->faker->optional()->sentence(),
            'address' => $this->faker->address(),
            // 'hometown' => $this->faker->city(),
            'company_name' => "",
            'gstin' => "",
            'created_by' => null,
            'updated_by' => null,
        ];
    }
}
