<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bank_id')->constrained('banks')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            
            // Optional relation
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();

            $table->enum('type', [
                'invoice payment',   // money in
                'expense',           // money out
                'manual credit',     // add money
                'manual debit',      // remove money
                'refund'             // money back
            ]);

            $table->enum('direction', ['credit', 'debit']); // credit = +, debit = -

            $table->decimal('amount', 15, 2);

            $table->date('transaction_date');

            $table->string('reference_no')->nullable();
            $table->text('remarks')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
