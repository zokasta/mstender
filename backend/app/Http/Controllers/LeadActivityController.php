<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeadActivity;
use App\Http\Controllers\Controller;

class LeadActivityController extends Controller
{
    public function store(Request $request)
    {
        $activity = LeadActivity::create([
            'lead_id' => $request->lead_id,
            'description' => $request->description,
            'activity_type' => $request->activity_type,
            'outcome' => $request->outcome,
            'next_action' => $request->next_action,
            'activity_time' => now(),
            'next_followup_at' => $request->next_followup_at,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ]);
    }

    public function destroy($id)
    {
        LeadActivity::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}