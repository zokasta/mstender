<?php

namespace App\Helpers;

use App\Models\Lead;
use App\Models\User;

class LeadAccess
{
    public static function query(User $user)
    {
        if ($user->isSuperAdmin()) {
            return Lead::query();
        }

        return Lead::where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhere('assigned_to', $user->id);
        });
    }
}