<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ Add this line

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes; // ✅ Add HasApiTokens here

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'otp',
        'otp_expiration',
        'remember_token',
        'remember_token_exp',
        'profile_image',
        'gender',
        'dob',
        'last_login_at',
        'last_ip_address',
        'is_banned',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
        'assigned_by',
        'assigned_to',
        'assigned_at',
        'settings',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp',
    ];

    protected $casts = [
        'settings' => 'array',
        'otp_expiration' => 'datetime',
        'remember_token_exp' => 'datetime',
        'dob' => 'date',
        'is_banned' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    /** 🔗 Relationships */

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    /** 🔐 Helpers */
    public function hasType(string $slug): bool
    {
        return $this->types()->where('slug', $slug)->exists();
    }

    public function setting()
    {
        return $this->hasOne(Setting::class);
    }

    public function notification()
    {
        return $this->hasMany(Notification::class);
    }

    public function isSuperAdmin()
    {
        return $this->type === 'superadmin';
    }

    public function isSales()
    {
        return $this->type === 'sales';
    }

    public function isIntern()
    {
        return $this->type === 'intern';
    }
}
