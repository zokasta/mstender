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
        'company',
        'phone',
        'details',
        'status',
        'source',
        'website',
        'address',
        'description',
        'image',
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

    public function notes()
    {
        return $this->hasMany(LeadNote::class);
    }
    public function pipeline()
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage()
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function activities()
    {
        return $this->hasMany(LeadActivity::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
