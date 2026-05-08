<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            // Required user info
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('gstin')->nullable();
            $table->index('gstin');
            $table->string('email');
            $table->index('email');
            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->string('phone', 15);
            $table->index('phone');

            // Status + remarks
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, rejected, etc.
            $table->text('remark')->nullable();
            $table->json('info')->nullable();

            // Addressing
            $table->text('address')->nullable();
            $table->string('hometown')->nullable();

            // audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
