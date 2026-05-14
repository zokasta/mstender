<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PipelineStage;
use App\Http\Controllers\Controller;

class PipelineStageController extends Controller
{
    public function store(Request $request)
    {
        $stage = PipelineStage::create([
            'pipeline_id' => $request->pipeline_id,
            'name' => $request->name,
            'color' => $request->color,
            'position' => $request->position ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'data' => $stage,
        ]);
    }

    public function update(Request $request, $id)
    {
        $stage = PipelineStage::findOrFail($id);

        $stage->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $stage,
        ]);
    }

    public function destroy($id)
    {
        PipelineStage::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}