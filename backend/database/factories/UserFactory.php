<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['male', 'female']);
        $name = $this->faker->name($gender);


        return [
            'name' => $name,
            'username' => $this->faker->unique()->userName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('+1##########'),
            'password' => Hash::make('password'), // default password
            'otp' => (string) rand(100000, 999999),
            'otp_expiration' => now()->addMinutes(10),
            'remember_token' => Str::random(20),
            'remember_token_exp' => now()->addDays(7),
            'profile_image' => $this->faker->imageUrl(200, 200, 'people', true, 'Profile'),
            'gender' => $gender,
            'type' => 'intern',
            'dob' => $this->faker->dateTimeBetween('-50 years', '-18 years'),
            'last_login_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            'last_ip_address' => $this->faker->ipv4(),
            'is_banned' => $this->faker->boolean(5),
            'status' => $this->faker->randomElement(['active', 'inactive', 'pending', 'suspended']),
            'created_by' => null,
            'updated_by' => null,
            'deleted_by' => null,
        ];
    }
}
