<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PipelineController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Pipeline::where('user_id', $request->user()->id)->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string'
        ]);

        $data['user_id'] = Auth::id();

        return response()->json([
            'message' => 'Pipeline created',
            'data' => Pipeline::create($data)
        ]);
    }

    public function show($id)
    {
        return response()->json(
            Pipeline::findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $pipeline = Pipeline::findOrFail($id);

        $pipeline->update($request->only(['name', 'description']));

        return response()->json(['message' => 'Updated']);
    }

    public function destroy($id)
    {
        Pipeline::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }
}