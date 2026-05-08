<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class InvoiceItem extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'invoice_id',
        'title',
        'qty',
        'price',
        'amount',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
