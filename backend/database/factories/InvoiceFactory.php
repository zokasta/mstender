<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition()
    {
        return [
            'customer_name' => $this->faker->name,
            'customer_email' => $this->faker->email,
            'customer_phone' => $this->faker->phoneNumber,
            'customer_address' => $this->faker->address,
            'invoice_date' => now(),
            'invoice_no' => 'INV-' . now()->format('Y') . '-' . strtoupper(Str::random(6)),
            'sub_total' => 1000,
            'total' => 1180,
            'created_by'=>User::inRandomOrder()->value('id'),
            'remember_token'=>Str::random(140),
        ];
    }
}
