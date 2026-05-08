<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvoiceTax extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'invoice_id',
        'tax_id',
        'tax_title',
        'mode',
        'rate',
        'amount',
    ];

    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }
}
