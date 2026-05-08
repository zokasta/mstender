<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadStageHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'from_stage_id',
        'to_stage_id',
        'changed_by',
        'changed_at'
    ];
}