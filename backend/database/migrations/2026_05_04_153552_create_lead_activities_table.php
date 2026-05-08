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
        Schema::create('lead_activities', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_type_id')->constrained('lead_activity_types');
        
            $table->text('description')->nullable();
            $table->string('outcome')->nullable();
            $table->string('next_action')->nullable();
        
            $table->timestamp('activity_time')->nullable();
            $table->timestamp('next_followup_at')->nullable();
        
            $table->foreignId('created_by')->nullable()->constrained('users');
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_activities');
    }
};
