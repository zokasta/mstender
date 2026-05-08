<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;

class InvoicesBulkExport implements FromCollection
{
    protected $invoices;

    public function __construct($invoices)
    {
        $this->invoices = $invoices;
    }

    public function collection()
    {
        return collect($this->invoices)->map(function ($invoice) {

            return [

                'ID' => $invoice->id,

                'Invoice No' => $invoice->invoice_no,

                'Customer' => $invoice->customer_name,

                'Total' => $invoice->total,

                'Paid' => $invoice->paid_amount,

                'Due' => $invoice->due_amount,

                'Status' => $invoice->status,

                'Date' => $invoice->invoice_date,
            ];
        });
    }
}