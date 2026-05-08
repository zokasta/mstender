<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bank_id',
        'title',
        'description',
        'invoice_id',
        'type',
        'amount',
        'transaction_date',
        'reference_no',
        'remarks',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
