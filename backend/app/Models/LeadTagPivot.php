<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadTagPivot extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'tag_id'];
}