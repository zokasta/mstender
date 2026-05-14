<?php

namespace App\Http\Controllers;

use App\Exports\InvoicesBulkExport;
use App\Models\Bank;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceTax;
use App\Models\Tax;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class InvoiceController extends Controller
{
    /**
     * =====================================================
     * INDEX
     * =====================================================
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $query = Invoice::with([
            'items',
            'taxes',
        ])->latest();

        // ✅ Sales only own invoices
        if ($user->type === 'sales') {
            $query->where('created_by', $user->id);
        }

        // 🔍 Search
        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('invoice_no', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        // 🔘 Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->paginate(
                $request->get('per_page', 10)
            )
        );
    }

    /**
     * =====================================================
     * STORE
     * =====================================================
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $data = $request->validate([

            'customer_id' => 'nullable|exists:customers,id',

            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string',
            'customer_address' => 'nullable|string',

            'invoice_no' => 'nullable|string|max:100',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',

            'items' => 'required|array|min:1',
            'items.*.title' => 'required|string',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',

            'discount_amount' => 'nullable|numeric|min:0',
            'discount_title' => 'nullable|string|min:0',
            'sub_total' => 'required|numeric|min:0',
            'before_tax' => 'required|numeric|min:0',
            'tax_total' => 'nullable|numeric|min:0',
            'round_off.value' => 'nullable|numeric',
            'total' => 'required|numeric|min:0',

            'taxes' => 'nullable|array',
            'taxes.*.tax_id' => 'required_with:taxes|exists:taxes,id',
            'taxes.*.mode' => 'required_with:taxes|in:included,excluded',

            'notes' => 'nullable|string',

            'payments' => 'nullable|array',
            'payments.*.bank_id' => 'required_with:payments|exists:banks,id',
            'payments.*.amount' => 'required_with:payments|numeric|min:0.01',
            'payments.*.transaction_date' => 'required_with:payments|date',
        ]);

        DB::beginTransaction();

        try {

            $invoice = Invoice::create([

                'remember_token' => Str::random(140),

                'customer_id' => $data['customer_id'] ?? null,

                'assigned_to' => $user->id,
                'assigned_by' => $user->id,
                'assigned_at' => now(),

                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_address' => $data['customer_address'] ?? null,

                'invoice_no' => $data['invoice_no'] ?? null,
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'] ?? null,

                'sub_total' => $data['sub_total'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'discount_title' => $data['discount_title'] ?? $data['discount_amount'],
                'before_tax' => $data['before_tax'],
                'tax_total' => $data['tax_total'] ?? 0,
                'round_off' => $data['round_off']['value'] ?? 0,

                'total' => $data['total'],

                'paid_amount' => 0,
                'due_amount' => $data['total'],

                'status' => 'unpaid',

                'notes' => $data['notes'] ?? null,

                'created_by' => $user->id,
            ]);

            /**
             * ITEMS
             */
            foreach ($data['items'] as $item) {

                InvoiceItem::create([

                    'invoice_id' => $invoice->id,

                    'title' => $item['title'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],

                    'amount' => (
                        $item['qty'] * $item['price']
                    ),

                    'created_by' => $user->id,
                ]);
            }

            /**
             * TAXES
             */
            if (!empty($data['taxes'])) {

                foreach ($data['taxes'] as $row) {

                    $tax = Tax::findOrFail(
                        $row['tax_id']
                    );

                    $amount = $row['mode'] === 'included'
                        ? (
                            $data['before_tax']
                            * $tax->rate
                        ) / (
                            100 + $tax->rate
                        )
                        : (
                            $data['before_tax']
                            * $tax->rate
                        ) / 100;

                    InvoiceTax::create([

                        'invoice_id' => $invoice->id,
                        'tax_id' => $tax->id,

                        'tax_title' => $tax->name,

                        'mode' => $row['mode'],
                        'rate' => $tax->rate,
                        'amount' => $amount,

                        'created_by' => $user->id,
                    ]);
                }
            }

            /**
             * PAYMENTS
             */
            if (!empty($data['payments'])) {

                foreach ($data['payments'] as $pay) {

                    if ($pay['amount'] > 0) {

                        $bank = Bank::findOrFail(
                            $pay['bank_id']
                        );

                        Transaction::create([

                            'bank_id' => $bank->id,
                            'invoice_id' => $invoice->id,

                            'type' => 'invoice payment',
                            'direction' => 'credit',

                            'amount' => $pay['amount'],

                            'transaction_date' => $pay['transaction_date'],

                            'created_by' => $user->id,
                        ]);

                        $bank->increment(
                            'balance',
                            $pay['amount']
                        );

                        $invoice->paid_amount += $pay['amount'];
                    }
                }

                $invoice->due_amount = (
                    $invoice->total
                    - $invoice->paid_amount
                );

                if ($invoice->due_amount == 0) {

                    $invoice->status = 'paid';

                } elseif ($invoice->due_amount < 0) {

                    $invoice->status = 'overpaid';

                } elseif ($invoice->paid_amount > 0) {

                    $invoice->status = 'partially paid';
                }

                $invoice->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data' => $invoice->load([
                    'items',
                    'taxes'
                ]),
            ], 201);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create invoice',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * =====================================================
     * DESTROY
     * =====================================================
     */
    public function destroy(
        Invoice $invoice,
        Request $request
    ) {

        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        // ✅ Sales only own invoice
        if (
            $user->type === 'sales'
            &&
            $invoice->created_by !== $user->id
        ) {
            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        if ($invoice->status === 'paid') {

            return response()->json([
                'success' => false,
                'message' => 'Paid invoice cannot be deleted',
            ], 422);
        }

        $invoice->deleted_by = $user->id;

        $invoice->save();

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully',
        ]);
    }

    /**
     * =====================================================
     * BULK DELETE
     * =====================================================
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $ids = $request->input('ids', []);

        if (
            !is_array($ids)
            ||
            empty($ids)
        ) {
            return response()->json([
                'message' => 'No IDs provided'
            ], 400);
        }

        DB::beginTransaction();

        try {

            $query = Invoice::whereIn(
                'id',
                $ids
            );

            // ✅ Sales only own invoices
            if ($user->type === 'sales') {
                $query->where(
                    'created_by',
                    $user->id
                );
            }

            foreach ($query->get() as $invoice) {

                if ($invoice->status === 'paid') {
                    continue;
                }

                $invoice->deleted_by = $user->id;

                $invoice->save();

                $invoice->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Invoices deleted successfully'
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete invoices',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * =====================================================
     * VIEW PUBLIC
     * =====================================================
     */
    public function view(Request $request)
    {
        $request->validate([

            'id' => 'required|exists:invoices,id',

            'remember_token' => 'required|string',
        ]);

        $invoice = Invoice::with([
            'items',
            'taxes'
        ])
            ->where('id', $request->id)
            ->where(
                'remember_token',
                $request->remember_token
            )
            ->first();

        if (!$invoice) {

            return response()->json([
                'success' => false,
                'message' => 'Invalid or tampered invoice',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    /**
     * =====================================================
     * BULK STATUS
     * =====================================================
     */
    public function bulkStatus(Request $request)
    {
        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $data = $request->validate([

            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:invoices,id',
            'status' => 'required|in:draft,paid,unpaid,cancelled,overdue,uncollectible'
        ]);

        DB::beginTransaction();

        try {

            $query = Invoice::whereIn(
                'id',
                $data['ids']
            );

            // ✅ Sales only own invoices
            if ($user->type === 'sales') {

                $query->where(
                    'created_by',
                    $user->id
                );
            }

            $invoices = $query
                ->lockForUpdate()
                ->get();

            foreach ($invoices as $invoice) {

                if (
                    $data['status'] === 'paid'
                    &&
                    $invoice->due_amount > 0
                ) {
                    continue;
                }

                if (
                    $invoice->status === 'paid'
                    &&
                    $data['status'] !== 'paid'
                ) {
                    continue;
                }

                $invoice->update([

                    'status' => $data['status'],

                    'updated_by' => $user->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Invoice statuses updated successfully'
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Failed to update invoice status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * =====================================================
     * BULK EXPORT
     * =====================================================
     */
    public function bulkExport(Request $request)
    {
        $data = $request->validate([

            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:invoices,id',

            'type' => 'required|in:pdf,excel'
        ]);

        $invoices = Invoice::with([
            'items',
            'taxes'
        ])
            ->whereIn('id', $data['ids'])
            ->get();

        if ($data['type'] === 'pdf') {

            $pdf = Pdf::loadView(
                'exports.bulk-invoices',
                [
                    'invoices' => $invoices
                ]
            );

            return $pdf->download(
                'invoices.pdf'
            );
        }

        if ($data['type'] === 'excel') {

            return Excel::download(
                new InvoicesBulkExport($invoices),
                'invoices.xlsx'
            );
        }
    }

    /**
     * =====================================================
     * PAY
     * =====================================================
     */
    public function pay(Request $request)
    {
        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $data = $request->validate([

            'invoice_id' => 'required|exists:invoices,id',

            'bank_id' => 'required|exists:banks,id',

            'amount' => 'required|numeric|min:0.01',

            'transaction_date' => 'required|date',
        ]);

        DB::beginTransaction();

        try {

            $invoice = Invoice::findOrFail(
                $data['invoice_id']
            );

            // ✅ Sales only own invoice
            if (
                $user->type === 'sales'
                &&
                $invoice->created_by !== $user->id
            ) {

                return response()->json([
                    'message' => 'You do not have permission'
                ], 403);
            }

            $bank = Bank::findOrFail(
                $data['bank_id']
            );

            // ❌ Prevent overpayment
            if (
                $data['amount']
                >
                $invoice->due_amount
            ) {

                return response()->json([
                    'message' => 'Payment exceeds due amount'
                ], 422);
            }

            Transaction::create([

                'bank_id' => $bank->id,

                'invoice_id' => $invoice->id,

                'type' => 'invoice payment',

                'direction' => 'credit',

                'amount' => $data['amount'],

                'transaction_date' => $data['transaction_date'],

                'created_by' => $user->id,
            ]);

            $bank->increment(
                'balance',
                $data['amount']
            );

            $invoice->paid_amount += $data['amount'];

            $invoice->due_amount = (
                $invoice->total
                - $invoice->paid_amount
            );

            if ($invoice->due_amount == 0) {

                $invoice->status = 'paid';

            } else {

                $invoice->status = 'partially paid';
            }

            $invoice->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully'
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}