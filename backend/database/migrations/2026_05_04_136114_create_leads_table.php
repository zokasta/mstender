
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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();

            // BASIC INFO
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('gstin')->nullable();
            $table->string('website')->nullable();
            $table->string('source')->nullable();
            $table->string('image')->nullable();
            $table->text('address')->nullable();
            $table->text('description')->nullable();

            // PIPELINE SYSTEM (CORE)
            $table->foreignId('pipeline_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stage_id')->nullable()->constrained('pipeline_stages')->nullOnDelete();
            $table->integer('position')->default(0);

            // BUSINESS DATA
            $table->decimal('value', 12, 2)->nullable(); // deal value
            $table->enum('status', ['hot', 'warm', 'cold'])->default('warm');

            // ASSIGNMENT
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable()->nullOnDelete();

            // FLEXIBLE DATA (CUSTOM FIELDS SUPPORT)
            $table->json('details')->nullable();

            // AUDIT
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
        Schema::dropIfExists('leads');
    }
};