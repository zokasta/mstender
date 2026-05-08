<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes, HasFactory;
    
    protected $fillable = [
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'invoice_no',
        'invoice_date',
        'due_date',
        'sub_total',
        'discount_title',
        'discount_amount',
        'before_tax',
        'tax_total',
        'remember_token',
        'round_off',
        'total',
        'notes',
        'created_by',
        'updated_by',
        'deleted_by',
        'assigned_to',
        'assigned_by',
        'assigned_at',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function taxes()
    {
        return $this->hasMany(InvoiceTax::class);
    }
}
