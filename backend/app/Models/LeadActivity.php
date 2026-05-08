<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'activity_type_id',
        'description',
        'outcome',
        'next_action',
        'activity_time',
        'next_followup_at',
        'created_by'
    ];
}