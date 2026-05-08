<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    protected array $allowedStatuses = [
        'pending',
        'confirmed',
        'cancelled',
        'rejected'
    ];

    /* =====================================================
     * INDEX
     * ===================================================== */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $query = Customer::query();

        // ✅ Sales only own customers
        if ($user->type === 'sales') {

            $query->where(
                'created_by',
                $user->id
            );
        }

        // 🔍 Search
        if ($search = trim((string) $request->get('search'))) {

            $query->where(function ($q) use ($search) {

                $q->where(
                    'name',
                    'like',
                    "%{$search}%"
                )
                    ->orWhere(
                        'phone',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'email',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        // 📌 Status Filter
        if ($status = $request->get('status')) {

            $query->where(
                'status',
                $status
            );
        }

        return response()->json(

            $query->latest()->paginate(

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
    public function store(
        Request $request
    ): JsonResponse {

        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $validated = $request->validate([


            'name' => [
                'required',
                'string'
            ],

            'email' => [
                'required',
                'email'
            ],

            'dob' => [
                'nullable',
                'date'
            ],

            'gender' => [
                'required',
                Rule::in([
                    'male',
                    'female'
                ])
            ],

            'phone' => [
                'required'
            ],

            'address' => [
                'nullable'
            ],

            'hometown' => [
                'nullable'
            ],
        ]);

        DB::beginTransaction();

        try {

            $customer = Customer::create([

                ...$validated,

                'created_by' => $user->id,
            ]);

            DB::commit();

            return response()->json([

                'success' => true,

                'data' => $customer,
            ]);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([

                'message' => $e->getMessage()
            ], 500);
        }
    }

    /* =====================================================
     * SHOW
     * ===================================================== */
    public function show($id): JsonResponse
    {
        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        $query = Customer::where(
            'id',
            $id
        );

        // ✅ Sales only own customer
        if ($user->type === 'sales') {

            $query->where(
                'created_by',
                $user->id
            );
        }

        $customer = $query->firstOrFail();

        return response()->json([

            'success' => true,

            'data' => $customer,
        ]);
    }

    /* =====================================================
     * UPDATE
     * ===================================================== */
    public function update(
        Request $request,
        $id,
    ): JsonResponse {

        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        DB::beginTransaction();

        try {

            $query = Customer::where(
                'id',
                $id
            );

            // ✅ Sales only own customer
            if ($user->type === 'sales') {

                $query->where(
                    'created_by',
                    $user->id
                );
            }

            $customer = $query
                ->lockForUpdate()
                ->firstOrFail();

            $validated = $request->validate([

                'name' => [
                    'sometimes',
                    'string'
                ],

                'email' => [
                    'sometimes',
                    'email'
                ],

                'dob' => [
                    'sometimes',
                    'date'
                ],

                'gender' => [
                    'sometimes',
                    Rule::in([
                        'male',
                        'female'
                    ])
                ],

                'phone' => [
                    'sometimes'
                ],

                'address' => [
                    'sometimes'
                ],

                'hometown' => [
                    'sometimes'
                ],

                'status' => [
                    'sometimes',
                    Rule::in(
                        $this->allowedStatuses
                    )
                ],

                'remark' => [
                    'nullable'
                ],
            ]);

            $customer->update([

                ...$validated,

                'updated_by' => $user->id,
            ]);

            DB::commit();

            return response()->json([

                'success' => true,

                'data' => $customer,
            ]);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([

                'message' => $e->getMessage()
            ], 500);
        }
    }

    /* =====================================================
     * DELETE
     * ===================================================== */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();

        // ❌ Intern blocked
        if ($user->type === 'intern') {

            return response()->json([
                'message' => 'You do not have permission'
            ], 403);
        }

        DB::beginTransaction();

        try {

            $query = Customer::where(
                'id',
                $id
            );

            // ✅ Sales only own customer
            if ($user->type === 'sales') {

                $query->where(
                    'created_by',
                    $user->id
                );
            }

            $customer = $query
                ->lockForUpdate()
                ->firstOrFail();

            $customer->update([

                'deleted_by' => $user->id
            ]);

            $customer->delete();

            DB::commit();

            return response()->json([

                'success' => true
            ]);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([

                'message' => $e->getMessage()
            ], 500);
        }
    }
}
