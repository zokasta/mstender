<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    protected $model = Setting::class;

    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id ?? User::factory(),
            'settings' => [
                'language' => $this->faker->randomElement(['en', 'fr', 'es']),
                'dark_mode' => $this->faker->boolean(),
                'timezone' => $this->faker->randomElement(['UTC', 'Asia/Dubai', 'Europe/Paris']),
                'theme_color' => $this->faker->safeColorName(),
            ],
            'created_by' => User::inRandomOrder()->first()->id ?? User::factory(),
            'updated_by' => User::inRandomOrder()->first()->id ?? User::factory(),
        ];
    }
}
