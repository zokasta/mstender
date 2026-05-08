<?php

namespace App\Http\Controllers;

use App\Models\PipelineStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PipelineStageController extends Controller
{
    public function index($pipeline_id)
    {
        return response()->json(
            PipelineStage::where('pipeline_id', $pipeline_id)
                ->orderBy('position')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pipeline_id' => 'required|exists:pipelines,id',
            'name' => 'required|string|max:100',
            'color' => 'nullable|string'
        ]);

        $data['position'] = PipelineStage::where('pipeline_id', $data['pipeline_id'])->count() + 1;

        return response()->json([
            'message' => 'Stage created',
            'data' => PipelineStage::create($data)
        ]);
    }

    public function update(Request $request, $id)
    {
        $stage = PipelineStage::findOrFail($id);

        $stage->update($request->only(['name', 'color']));

        return response()->json(['message' => 'Updated']);
    }

    public function destroy($id)
    {
        PipelineStage::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function reorder(Request $request)
    {
        $data = $request->validate([
            'stages' => 'required|array'
        ]);

        DB::beginTransaction();
        try {
            foreach ($data['stages'] as $index => $stageId) {
                PipelineStage::where('id', $stageId)
                    ->update(['position' => $index + 1]);
            }

            DB::commit();
            return response()->json(['message' => 'Reordered']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}