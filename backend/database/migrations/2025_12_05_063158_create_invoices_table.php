<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();

            // 🔹 Assignment / Ownership
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();

            // Bill To (snapshot – editable)
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('customer_address')->nullable();

            // Invoice info
            $table->string('invoice_no');
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->string('remember_token', 255)->nullable();

            // Totals
            $table->decimal('sub_total', 12, 2)->default(0);
            $table->string('discount_title', 50)->default('discount');
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('before_tax', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('round_off', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            // Notes
            $table->text('notes')->nullable();
            $table->enum('status', [
                'draft',
                'pending',
                'paid',
                'partially paid',
                'unpaid',
                'overpaid',
                'cancelled',
                'overdue',
                'uncollectible'
            ])->default('draft');
            
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
