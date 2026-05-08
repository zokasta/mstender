<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class BankController extends Controller
{
    /* =====================================================
     * INDEX
     * ===================================================== */
    public function index(Request $request)
    {
        $user = $request->user();

        // ❌ Intern cannot access
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $query = Bank::query();

        // ✅ Sales only own created records
        if ($user->type === 'sales') {
            $query->where('created_by', $user->id);
        }

        // 🔍 Search
        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // 🔘 Status filter
        if ($status = $request->get('status')) {
            $query->where(
                'is_active',
                strtolower($status) === 'active'
            );
        }

        return response()->json(
            $query->latest()->paginate(
                (int) $request->get('per_page', 10)
            )
        );
    }

    /* =====================================================
     * STORE
     * ===================================================== */
    public function store(Request $request)
    {
        $user = $request->user();

        // ❌ Intern cannot create
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $data = $request->validate([
            'name'           => 'required|string|max:150',
            'branch'         => 'nullable|string|max:150',
            'account_number' => 'nullable|string|max:50',
            'ifsc_code'      => 'nullable|string|max:20',
            'account_type'   => 'required|in:savings,current,business,cash',
            'is_active'      => 'boolean',
        ]);

        $bank = Bank::create([
            ...$data,

            'created_by' => $user->id,
            'assigned_to' => $user->id,
            'assigned_by' => $user->id,
            'assigned_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $bank,
        ], 201);
    }

    /* =====================================================
     * SHOW
     * ===================================================== */
    public function show($id)
    {
        $user = Auth::user();

        // ❌ Intern cannot access
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $query = Bank::where('id', $id);

        // ✅ Sales only own records
        if ($user->type === 'sales') {
            $query->where('created_by', $user->id);
        }

        $bank = $query->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $bank,
        ]);
    }

    /* =====================================================
     * UPDATE
     * ===================================================== */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        // ❌ Intern cannot update
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $data = $request->validate([
            'name'           => 'required|string|max:150',
            'branch'         => 'nullable|string|max:150',
            'account_number' => 'nullable|string|max:50',
            'ifsc_code'      => 'nullable|string|max:20',
            'account_type'   => 'required|in:savings,current,business,cash',
            'is_active'      => 'boolean',
        ]);

        DB::beginTransaction();

        try {

            $query = Bank::where('id', $id);

            // ✅ Sales only own records
            if ($user->type === 'sales') {
                $query->where('created_by', $user->id);
            }

            $bank = $query->lockForUpdate()->firstOrFail();

            $bank->update([
                ...$data,
                'updated_by' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $bank,
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /* =====================================================
     * DESTROY
     * ===================================================== */
    public function destroy($id)
    {
        $user = Auth::user();

        // ❌ Intern cannot delete
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        DB::beginTransaction();

        try {

            $query = Bank::where('id', $id);

            // ✅ Sales only own records
            if ($user->type === 'sales') {
                $query->where('created_by', $user->id);
            }

            $bank = $query->lockForUpdate()->firstOrFail();

            $bank->update([
                'deleted_by' => $user->id
            ]);

            $bank->delete();

            DB::commit();

            return response()->json([
                'success' => true
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /* =====================================================
     * BULK STATUS
     * ===================================================== */
    public function bulkStatus(Request $request)
    {
        $user = $request->user();

        // ❌ Intern cannot access
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $ids = $request->input('ids', []);
        $status = $request->input('is_active');

        if (!$ids || !is_bool($status)) {
            return response()->json([
                'message' => 'Invalid input'
            ], 400);
        }

        $query = Bank::whereIn('id', $ids);

        // ✅ Sales only own records
        if ($user->type === 'sales') {
            $query->where('created_by', $user->id);
        }

        $query->update([
            'is_active' => $status,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true
        ]);
    }

    /* =====================================================
     * BULK DELETE
     * ===================================================== */
    public function bulkDelete(Request $request)
    {
        $user = $request->user();

        // ❌ Intern cannot access
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $ids = $request->input('ids', []);

        if (!$ids) {
            return response()->json([
                'message' => 'No IDs provided'
            ], 400);
        }

        DB::beginTransaction();

        try {

            $query = Bank::whereIn('id', $ids);

            // ✅ Sales only own records
            if ($user->type === 'sales') {
                $query->where('created_by', $user->id);
            }

            foreach ($query->lockForUpdate()->get() as $bank) {

                $bank->update([
                    'deleted_by' => $user->id
                ]);

                $bank->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /* =====================================================
     * TOGGLE STATUS
     * ===================================================== */
    public function toggleStatus(Request $request, $id)
    {
        $user = $request->user();

        // ❌ Intern cannot access
        if ($user->type === 'intern') {
            return response()->json([
                'message' => 'You do not have permission',
            ], 403);
        }

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        DB::beginTransaction();

        try {

            $query = Bank::where('id', $id);

            // ✅ Sales only own records
            if ($user->type === 'sales') {
                $query->where('created_by', $user->id);
            }

            $bank = $query->lockForUpdate()->firstOrFail();

            $bank->update([
                'is_active' => $request->is_active,
                'updated_by' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bank status updated successfully',
                'data' => [
                    'id' => $bank->id,
                    'is_active' => $bank->is_active,
                ],
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}