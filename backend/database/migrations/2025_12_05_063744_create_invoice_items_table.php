<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
 /**
         * INVOICE ITEMS TABLE (unchanged)
         */
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
        
            $table->string('title');
            $table->integer('qty');
            $table->decimal('price', 12, 2);
            $table->decimal('amount', 12, 2);
        
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();
        });
        
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
