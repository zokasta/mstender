<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadStageHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::query();

        if ($request->filled('pipeline_id')) {
            $query->where('pipeline_id', $request->pipeline_id);
        }

        if ($request->filled('stage_id')) {
            $query->where('stage_id', $request->stage_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) =>
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
            );
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'nullable|exists:pipeline_stages,id',
            'name' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'details' => 'nullable|array'
        ]);

        DB::beginTransaction();
        try {
            $data['created_by'] = Auth::id();

            $lead = Lead::create($data);

            LeadStageHistory::create([
                'lead_id' => $lead->id,
                'to_stage_id' => $lead->stage_id,
                'changed_by' => Auth::id()
            ]);

            DB::commit();

            return response()->json(['data' => $lead]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $lead = Lead::findOrFail($id);

        $data = $request->validate([
            'stage_id' => 'nullable|exists:pipeline_stages,id',
            'name' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'details' => 'nullable|array'
        ]);

        DB::beginTransaction();
        try {
            if (isset($data['stage_id']) && $data['stage_id'] != $lead->stage_id) {
                LeadStageHistory::create([
                    'lead_id' => $lead->id,
                    'from_stage_id' => $lead->stage_id,
                    'to_stage_id' => $data['stage_id'],
                    'changed_by' => Auth::id()
                ]);
            }

            $lead->update($data);

            DB::commit();

            return response()->json(['message' => 'Updated']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        Lead::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function changeStage(Request $request)
    {
        $data = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'stage_id' => 'required|exists:pipeline_stages,id'
        ]);

        DB::beginTransaction();
        try {
            $lead = Lead::findOrFail($data['lead_id']);

            LeadStageHistory::create([
                'lead_id' => $lead->id,
                'from_stage_id' => $lead->stage_id,
                'to_stage_id' => $data['stage_id'],
                'changed_by' => Auth::id()
            ]);

            $lead->update(['stage_id' => $data['stage_id']]);

            DB::commit();

            return response()->json(['message' => 'Stage updated']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function assign(Request $request)
    {
        $data = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'assigned_to' => 'required|exists:users,id'
        ]);

        $lead = Lead::findOrFail($data['lead_id']);

        $lead->update([
            'assigned_to' => $data['assigned_to'],
            'assigned_by' => Auth::id(),
            'assigned_at' => now()
        ]);

        return response()->json(['message' => 'Assigned']);
    }

    public function export()
    {
        $leads = Lead::all();

        $csv = "Name,Email,Phone\n";

        foreach ($leads as $lead) {
            $csv .= "{$lead->name},{$lead->email},{$lead->phone}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename=leads.csv');
    }
}