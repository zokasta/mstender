<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Bank;
use App\Models\Invoice;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

use Exception;

class TransactionController extends Controller
{
    /* =====================================================
     * INDEX
     * ===================================================== */
    public function index(Request $request)
    {
        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $query = Transaction::with([
            'bank',
            'invoice'
        ]);

        // ✅ Sales only own transactions
        if ($user->type === 'sales') {

            $query->where(
                'created_by',
                $user->id
            );
        }

        /* =====================================================
         * FILTERS
         * ===================================================== */

        if ($type = $request->get('type')) {

            $query->where(
                'type',
                $type
            );
        }

        if ($bankId = $request->get('bank_id')) {

            $query->where(
                'bank_id',
                $bankId
            );
        }

        if ($invoiceId = $request->get('invoice_id')) {

            $query->where(
                'invoice_id',
                $invoiceId
            );
        }

        if ($from = $request->get('from_date')) {

            $query->whereDate(
                'transaction_date',
                '>=',
                $from
            );
        }

        if ($to = $request->get('to_date')) {

            $query->whereDate(
                'transaction_date',
                '<=',
                $to
            );
        }

        $query->latest();

        return response()->json(

            $query->paginate(
                (int) $request->get(
                    'per_page',
                    15
                )
            )
        );
    }

    /* =====================================================
     * STORE
     * ===================================================== */
    public function store(Request $request)
    {
        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $validated = $request->validate([

            'bank_id' => [
                'required',
                'exists:banks,id'
            ],

            'invoice_id' => [
                'nullable',
                'exists:invoices,id'
            ],

            'type' => [
                'required',
                Rule::in([
                    'invoice payment',
                    'expense',
                    'manual credit',
                    'manual debit',
                    'refund'
                ])
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01'
            ],

            'transaction_date' => [
                'required',
                'date'
            ],

            'reference_no' => [
                'nullable',
                'string',
                'max:100'
            ],

            'remarks' => [
                'nullable',
                'string'
            ],
        ]);

        DB::beginTransaction();

        try {

            /* =====================================================
             * INVOICE PAYMENT VALIDATION
             * ===================================================== */

            $invoice = null;

            if (
                $validated['type'] ===
                'invoice payment'
            ) {

                if (
                    empty($validated['invoice_id'])
                ) {

                    return response()->json([
                        'message' =>
                        'Invoice is required for invoice payment'
                    ], 422);
                }

                $invoice = Invoice::lockForUpdate()
                    ->findOrFail(
                        $validated['invoice_id']
                    );

                $remainingDue =
                    $invoice->total -
                    $invoice->paid_amount;

                // ❌ Overpayment
                if (
                    $validated['amount'] >
                    $remainingDue
                ) {

                    return response()->json([

                        'message' =>
                        'Payment amount exceeds due amount',

                        'details' => [

                            'invoice_total' =>
                            $invoice->total,

                            'paid_amount' =>
                            $invoice->paid_amount,

                            'due_amount' =>
                            $remainingDue,
                        ]

                    ], 422);
                }
            }

            /* =====================================================
             * CREATE
             * ===================================================== */

            $transaction = Transaction::create([

                ...$validated,

                'direction' => in_array(
                    $validated['type'],
                    [
                        'invoice payment',
                        'manual credit'
                    ]
                )
                    ? 'credit'
                    : 'debit',

                'created_by' => $user->id,
            ]);

            /* =====================================================
             * UPDATE BANK BALANCE
             * ===================================================== */

            $this->applyBankBalance(
                $transaction
            );

            /* =====================================================
             * UPDATE INVOICE
             * ===================================================== */

            if ($invoice) {

                $invoice->paid_amount +=
                    $transaction->amount;

                $invoice->due_amount = max(
                    $invoice->total -
                        $invoice->paid_amount,
                    0
                );

                if (
                    $invoice->paid_amount <= 0
                ) {

                    $invoice->status =
                        'unpaid';
                } elseif (
                    $invoice->paid_amount <
                    $invoice->total
                ) {

                    $invoice->status =
                        'partially paid';
                } else {

                    $invoice->status =
                        'paid';
                }

                $invoice->updated_by =
                    $user->id;

                $invoice->save();
            }

            DB::commit();

            return response()->json([

                'success' => true,

                'message' =>
                'Transaction created successfully',

                'data' => $transaction

            ], 201);
        } catch (Exception $ex) {

            DB::rollBack();

            return response()->json([

                'message' =>
                'Failed to create transaction',

                'error' =>
                $ex->getMessage()

            ], 500);
        }
    }

    /* =====================================================
     * SHOW
     * ===================================================== */
    public function show(
        Request $request,
        $id
    ) {

        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' =>
                'You do not have permission'
            ], 403);
        }

        $query = Transaction::with([
            'bank',
            'invoice'
        ])->where('id', $id);

        // ✅ Sales only own
        if ($user->type === 'sales') {

            $query->where(
                'created_by',
                $user->id
            );
        }

        return response()->json([

            'success' => true,

            'data' => $query->firstOrFail()
        ]);
    }

    /* =====================================================
     * UPDATE
     * ===================================================== */
    public function update(
        Request $request,
        $id
    ) {

        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' =>
                'You do not have permission'
            ], 403);
        }

        DB::beginTransaction();

        try {

            $query = Transaction::where(
                'id',
                $id
            );

            // ✅ Sales only own
            if ($user->type === 'sales') {

                $query->where(
                    'created_by',
                    $user->id
                );
            }

            $transaction = $query
                ->lockForUpdate()
                ->firstOrFail();

            $validated = $request->validate([

                'amount' => [
                    'sometimes',
                    'numeric',
                    'min:0.01'
                ],

                'reference_no' => [
                    'nullable',
                    'string',
                    'max:100'
                ],

                'remarks' => [
                    'nullable',
                    'string'
                ],
            ]);

            $oldAmount =
                $transaction->amount;

            $oldType =
                $transaction->type;

            $transaction->update([

                ...$validated,

                'updated_by' =>
                $user->id,
            ]);

            /* =====================================================
             * UPDATE BALANCE
             * ===================================================== */

            $this->reverseBankBalance(
                $transaction->bank_id,
                $oldType,
                $oldAmount
            );

            $this->applyBankBalance(
                $transaction
            );

            /* =====================================================
             * UPDATE INVOICE STATUS
             * ===================================================== */

            if (
                $transaction->invoice_id
            ) {

                $this->updateInvoiceStatus(
                    $transaction->invoice_id
                );
            }

            DB::commit();

            return response()->json([
                'success' => true
            ]);
        } catch (Exception $ex) {

            DB::rollBack();

            return response()->json([
                'error' =>
                $ex->getMessage()
            ], 500);
        }
    }

    /* =====================================================
     * DESTROY
     * ===================================================== */
    public function destroy(
        Request $request,
        $id
    ) {

        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' =>
                'You do not have permission'
            ], 403);
        }

        DB::beginTransaction();

        try {

            $query = Transaction::where(
                'id',
                $id
            );

            // ✅ Sales only own
            if ($user->type === 'sales') {

                $query->where(
                    'created_by',
                    $user->id
                );
            }

            $transaction = $query
                ->lockForUpdate()
                ->firstOrFail();

            $this->reverseBankBalance(

                $transaction->bank_id,

                $transaction->type,

                $transaction->amount
            );

            $transaction->update([

                'deleted_by' =>
                $user->id
            ]);

            $transaction->delete();

            if (
                $transaction->invoice_id
            ) {

                $this->updateInvoiceStatus(
                    $transaction->invoice_id
                );
            }

            DB::commit();

            return response()->json([
                'success' => true
            ]);
        } catch (Exception $ex) {

            DB::rollBack();

            return response()->json([
                'error' =>
                $ex->getMessage()
            ], 500);
        }
    }

    /* =====================================================
     * BULK DELETE
     * ===================================================== */
    public function bulkDelete(
        Request $request
    ) {

        $user = $request->user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' =>
                'You do not have permission'
            ], 403);
        }

        $ids = $request->input(
            'ids',
            []
        );

        if (!$ids) {

            return response()->json([
                'message' => 'No IDs'
            ], 400);
        }

        DB::beginTransaction();

        try {

            $query = Transaction::whereIn(
                'id',
                $ids
            );

            // ✅ Sales only own
            if ($user->type === 'sales') {

                $query->where(
                    'created_by',
                    $user->id
                );
            }

            foreach (
                $query->lockForUpdate()->get()
                as $transaction
            ) {

                $this->reverseBankBalance(

                    $transaction->bank_id,

                    $transaction->type,

                    $transaction->amount
                );

                $transaction->update([

                    'deleted_by' =>
                    $user->id
                ]);

                $transaction->delete();

                if (
                    $transaction->invoice_id
                ) {

                    $this->updateInvoiceStatus(
                        $transaction->invoice_id
                    );
                }
            }

            DB::commit();

            return response()->json([
                'success' => true
            ]);
        } catch (Exception $ex) {

            DB::rollBack();

            return response()->json([
                'error' =>
                $ex->getMessage()
            ], 500);
        }
    }

    /* =====================================================
     * HELPERS
     * ===================================================== */

    protected function isCredit($type)
    {
        return in_array($type, [
            'invoice payment',
            'manual credit'
        ]);
    }

    protected function applyBankBalance(
        Transaction $transaction
    ) {

        $bank = Bank::findOrFail(
            $transaction->bank_id
        );

        if (
            $this->isCredit(
                $transaction->type
            )
        ) {

            $bank->balance +=
                $transaction->amount;
        } else {

            $bank->balance -=
                $transaction->amount;
        }

        $bank->save();
    }

    protected function reverseBankBalance(
        $bankId,
        $type,
        $amount
    ) {

        $bank = Bank::findOrFail(
            $bankId
        );

        if (
            $this->isCredit($type)
        ) {

            $bank->balance -=
                $amount;
        } else {

            $bank->balance +=
                $amount;
        }

        $bank->save();
    }

    protected function updateInvoiceStatus(
        $invoiceId
    ) {

        $invoice = Invoice::find(
            $invoiceId
        );

        if (!$invoice) return;

        $paid = Transaction::where(
            'invoice_id',
            $invoiceId
        )->sum('amount');

        $invoice->paid_amount =
            $paid;

        $invoice->due_amount = max(
            $invoice->total - $paid,
            0
        );

        if ($paid <= 0) {

            $invoice->status =
                'unpaid';
        } elseif (
            $paid < $invoice->total
        ) {

            $invoice->status =
                'partially paid';
        } else {

            $invoice->status =
                'paid';
        }

        $invoice->save();
    }
}
