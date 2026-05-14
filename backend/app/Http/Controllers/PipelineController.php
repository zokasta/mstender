<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\PipelineStage;
use Illuminate\Support\Facades\DB;

class PipelineController extends Controller
{
    /* =====================================================
    * INDEX
    * ===================================================== */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->type === 'intern') {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission',
            ], 403);
        }

        $query = Pipeline::with([
            'stages' => function ($q) {
                $q->orderBy('position');
            }
        ]);


        if ($user->type === 'sales') {

            $query->where('created_by', $user->id);
        }

        if ($search = $request->get('search')) {

            $query->where(function ($q) use ($search) {

                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }


        if ($status = $request->get('status')) {

            $query->where(
                'is_active',
                strtolower($status) === 'active'
            );
        }


        $pipelines = $query
            ->latest()
            ->paginate(
                (int) $request->get('per_page', 10)
            );

        return response()->json([
            'success' => true,
            'data' => $pipelines,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        DB::beginTransaction();

        try {
            $pipeline = Pipeline::create([
                'name' => $request->name,
                'description' => $request->description,
                'created_by' => $request->user()->id,
            ]);

            PipelineStage::create([
                'pipeline_id' => $pipeline->id,
                'name' => 'New Leads',
                'color' => '#3b82f6',
                'position' => 1,
                'is_default' => true,
                'created_by' => $request->user()->id,
            ]);

            DB::commit();

            $pipeline->load('stages');

            return response()->json([
                'success' => true,

                'message' => 'Pipeline created successfully',

                'data' => $pipeline,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,

                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $pipeline = Pipeline::findOrFail($id);

        $pipeline->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $pipeline,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $pipeline = Pipeline::with([
            'user:id,name,email',

            'stages' => function ($q) {
                $q->orderBy('position');
            },

            'leads' => function ($q) {
                $q->with([
                    'stage:id,name,color',
                    'assignedTo:id,name,email',
                ])
                    ->latest();
            }
        ])->findOrFail($id);
        if ($user->type !== 'superadmin') {
            if ($pipeline->user_id != $user->id) {

                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view this pipeline'
                ], 403);
            }
        }
        return response()->json([
            'success' => true,

            'data' => [

                'pipeline' => [
                    'id' => $pipeline->id,
                    'name' => $pipeline->name,
                    'description' => $pipeline->description,
                    'is_active' => $pipeline->is_active,
                    'created_at' => $pipeline->created_at,
                ],
                'owner' => $pipeline->user,
                'total_stages' => $pipeline->stages->count(),
                'total_leads' => $pipeline->leads->count(),
                'stages' => $pipeline->stages,
                'leads' => $pipeline->leads,
            ]
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $pipeline = Pipeline::with(['stages', 'leads'])->findOrFail($id);
        if ($user->type !== 'superadmin') {
            if ($pipeline->user_id != $user->id) {

                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete this pipeline'
                ], 403);
            }
        }

        if ($pipeline->stages()->count() > 0) {

            return response()->json([
                'success' => false,
                'message' => 'Cannot delete pipeline because stages exist'
            ], 422);
        }

        if ($pipeline->leads()->count() > 0) {

            return response()->json([
                'success' => false,
                'message' => 'Cannot delete pipeline because leads exist'
            ], 422);
        }

        $pipeline->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pipeline deleted successfully'
        ]);
    }

    public function bulkStatus(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | INTERN RESTRICTION
        |--------------------------------------------------------------------------
        */

        if ($user->type === 'intern') {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission',
            ], 403);
        }

        $ids = $request->input('ids', []);

        $status = $request->input('is_active');


        if (
            !is_array($ids) ||
            empty($ids) ||
            !is_bool($status)
        ) {

            return response()->json([
                'success' => false,
                'message' => 'Invalid input'
            ], 400);
        }

        $query = Pipeline::whereIn('id', $ids);


        if ($user->type !== 'superadmin') {

            $query->where('user_id', $user->id);
        }

        $query->update([
            'is_active' => $status,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pipeline status updated successfully'
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $user = $request->user();


        if ($user->type === 'intern') {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission',
            ], 403);
        }

        $ids = $request->input('ids', []);

        if (
            !is_array($ids) ||
            empty($ids)
        ) {

            return response()->json([
                'success' => false,
                'message' => 'No IDs provided'
            ], 400);
        }

        DB::beginTransaction();

        try {

            $query = Pipeline::whereIn('id', $ids);



            if ($user->type !== 'superadmin') {

                $query->where('user_id', $user->id);
            }

            $pipelines = $query
                ->with(['stages', 'leads'])
                ->lockForUpdate()
                ->get();


            foreach ($pipelines as $pipeline) {

                if ($pipeline->stages()->count() > 0) {

                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => "Cannot delete pipeline '{$pipeline->name}' because stages exist"
                    ], 422);
                }

                if ($pipeline->leads()->count() > 0) {

                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => "Cannot delete pipeline '{$pipeline->name}' because leads exist"
                    ], 422);
                }
            }

            foreach ($pipelines as $pipeline) {

                $pipeline->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pipelines deleted successfully'
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleActive(Request $request, $id)
    {
        $user = $request->user();



        if ($user->type === 'intern') {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission',
            ], 403);
        }

        $pipeline = Pipeline::findOrFail($id);

        if ($user->type !== 'superadmin') {

            if ($pipeline->user_id != $user->id) {

                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to update this pipeline',
                ], 403);
            }
        }


        $pipeline->update([
            'is_active' => !$pipeline->is_active,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,

            'message' => $pipeline->is_active
                ? 'Pipeline activated successfully'
                : 'Pipeline deactivated successfully',

            'data' => [
                'id' => $pipeline->id,
                'is_active' => $pipeline->is_active,
            ]
        ]);
    }
}
