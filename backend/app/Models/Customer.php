<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /* =====================================================
     | Fillable
     ===================================================== */
    protected $fillable = [
        'name',
        'email',
        'gender',
        'gstin',
        'dob',
        'company_name',
        'phone',
        'status',
        'remark',
        'address',
        'hometown',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    /* =====================================================
     | Casts
     ===================================================== */
    protected $casts = [
        'dob' => 'date',
        'deleted_at' => 'datetime',
    ];

    /* =====================================================
     | Hidden Fields (Optional - Recommended)
     ===================================================== */
    protected $hidden = [
        // Uncomment if you don’t want to expose raw ID
        // 'media_file_ref_id',
    ];

    /* =====================================================
     | Relationships
     ===================================================== */

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

    /* =====================================================
     | Accessors
     ===================================================== */


    /**
     * Get calculated age from DOB (Optional upgrade)
     */
    public function getAgeAttribute(): ?int
    {
        return $this->dob?->age;
    }

    /* =====================================================
     | Scopes (Optional but Professional)
     ===================================================== */

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled', 'rejected']);
    }

    public function scopeSearch($query, ?string $search)
    {
        if (!$search) return $query;

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('gstin', 'like', "%{$search}%")
                ->orWhere('company_name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('hometown', 'like', "%{$search}%");
        });
    }
}
