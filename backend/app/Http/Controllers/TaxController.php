<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class TaxController extends Controller
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

        $query = Tax::query();

        // 🔍 Search
        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // 🔘 Status filter
        if (!is_null($request->get('status'))) {
            $query->where(
                'is_active',
                strtolower($request->get('status')) === 'active'
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

        // ❌ Only superadmin
        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Only superadmin can create taxes',
            ], 403);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'code'        => 'required|string|max:50|unique:taxes,code',
            'rate'        => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $tax = Tax::create([
            ...$data,
            'created_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $tax,
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

        $tax = Tax::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tax,
        ]);
    }

    /* =====================================================
     * UPDATE
     * ===================================================== */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        // ❌ Only superadmin
        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Only superadmin can update taxes',
            ], 403);
        }

        $tax = Tax::findOrFail($id);

        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'code'        => 'required|string|max:50|unique:taxes,code,' . $tax->id,
            'rate'        => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $tax->update([
            ...$data,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $tax,
        ]);
    }

    /* =====================================================
     * DESTROY
     * ===================================================== */
    public function destroy($id)
    {
        $user = Auth::user();

        // ❌ Only superadmin
        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Only superadmin can delete taxes',
            ], 403);
        }

        DB::beginTransaction();

        try {

            $tax = Tax::lockForUpdate()->findOrFail($id);

            $tax->update([
                'deleted_by' => $user->id
            ]);

            $tax->delete();

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

    public function bulkStatus(Request $request)
    {
        $user = $request->user();

        // ❌ Only superadmin
        if ($user->type !== 'superadmin') {

            return response()->json([
                'message' => 'Only superadmin can update status',
            ], 403);
        }

        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:taxes,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        $isActive = $data['status'] === 'Active';

        Tax::whereIn('id', $data['ids'])->update([
            'is_active' => $isActive,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tax status updated successfully',
        ]);
    }

    /* =====================================================
     * BULK DELETE
     * ===================================================== */
    public function bulkDelete(Request $request)
    {
        $user = $request->user();

        // ❌ Only superadmin
        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Only superadmin can bulk delete',
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

            foreach (
                Tax::lockForUpdate()
                    ->whereIn('id', $ids)
                    ->get() as $tax
            ) {

                $tax->update([
                    'deleted_by' => $user->id
                ]);

                $tax->delete();
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

        // ❌ Only superadmin
        if ($user->type !== 'superadmin') {
            return response()->json([
                'message' => 'Only superadmin can update status',
            ], 403);
        }

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $tax = Tax::findOrFail($id);

        $tax->update([
            'is_active' => $request->is_active,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tax status updated successfully',
            'data' => [
                'id' => $tax->id,
                'is_active' => $tax->is_active,
            ],
        ]);
    }
}
