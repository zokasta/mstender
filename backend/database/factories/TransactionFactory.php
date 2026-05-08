<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\Bank;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition()
    {
        return [
            'bank_id' => Bank::inRandomOrder()->first()->id,
            'invoice_id' => Invoice::inRandomOrder()->first()->id,
            'type' => $this->faker->randomElement([
                'invoice payment',
                'expense',
                'manual credit',
                'manual debit',
                'refund'
            ]),
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'transaction_date' => $this->faker->date(),
            'reference_no' => strtoupper($this->faker->bothify('REF-####')),
            'remarks' => $this->faker->sentence(),
        ];
    }
}
