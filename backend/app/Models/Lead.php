<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pipeline_id',
        'stage_id',
        'name',
        'email',
        'phone',
        'details',
        'assigned_to',
        'assigned_by',
        'assigned_at',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    protected $casts = [
        'details' => 'array',
        'reschedule_date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
