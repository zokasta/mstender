<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LeadController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LEADS QUERY ACCESS
    |--------------------------------------------------------------------------
    */

    private function leadQuery($user)
    {
        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->type === 'superadmin') {

            return Lead::query();
        }

        /*
        |--------------------------------------------------------------------------
        | SALES / INTERN
        |--------------------------------------------------------------------------
        */

        return Lead::where(function ($q) use ($user) {

            $q->where('created_by', $user->id)

                ->orWhere('assigned_to', $user->id);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | LEADS LIST
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $user = $request->user();

        $query = $this->leadQuery($user);

        /*
        |--------------------------------------------------------------------------
        | FILTER BY PIPELINE
        |--------------------------------------------------------------------------
        */

        if ($request->pipeline_id) {

            $query->where(
                'pipeline_id',
                $request->pipeline_id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BY STAGE
        |--------------------------------------------------------------------------
        */

        if ($request->stage_id) {

            $query->where(
                'stage_id',
                $request->stage_id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->search) {

            $query->where(function ($q) use ($request) {

                $q->where(
                    'name',
                    'LIKE',
                    "%{$request->search}%"
                )

                    ->orWhere(
                        'email',
                        'LIKE',
                        "%{$request->search}%"
                    )

                    ->orWhere(
                        'company',
                        'LIKE',
                        "%{$request->search}%"
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | GET LEADS
        |--------------------------------------------------------------------------
        */

        $leads = $query

            ->with([
                'pipeline',
                'stage',
                'assignedUser',
            ])

            ->orderBy('position')

            ->latest()

            ->get();

        return response()->json([

            'success' => true,

            'data' => $leads,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | LEAD DETAILS
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $lead = $this->leadQuery($user)

            ->with([
                'pipeline',
                'stage',
                'assignedUser',
                'activities.user',
                'notes.comments.user',
            ])

            ->findOrFail($id);

        return response()->json([

            'success' => true,

            'data' => $lead,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE LEAD
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $request->validate([

            'name' => 'required|string|max:255',

            'pipeline_id' => 'required|exists:pipelines,id',

            'stage_id' => 'nullable|exists:pipeline_stages,id',

            'email' => 'nullable|email',

            'phone' => 'nullable|string|max:20',

            'value' => 'nullable|numeric',
        ]);

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $lead = Lead::create([

            'name' => $request->name,

            'email' => $request->email,

            'phone' => $request->phone,

            'company' => $request->company,

            'gstin' => $request->gstin,

            'website' => $request->website,

            'source' => $request->source,

            'address' => $request->address,

            'description' => $request->description,

            'pipeline_id' => $request->pipeline_id,

            'stage_id' => $request->stage_id,

            'value' => $request->value,

            'status' => $request->status ?? 'worm',

            /*
            |--------------------------------------------------------------------------
            | ASSIGNMENT
            |--------------------------------------------------------------------------
            */

            'assigned_to' =>
            $request->assigned_to
                ?? $user->id,

            'assigned_by' => $user->id,

            'assigned_at' => now(),

            /*
            |--------------------------------------------------------------------------
            | AUDIT
            |--------------------------------------------------------------------------
            */

            'created_by' => $user->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
            'Lead created successfully',

            'data' => $lead->load([
                'pipeline',
                'stage',
                'assignedUser',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE LEAD
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        $id
    ) {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | FIND LEAD
        |--------------------------------------------------------------------------
        */

        $lead = $this->leadQuery($user)

            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $lead->update([

            'name' => $request->name,

            'email' => $request->email,

            'phone' => $request->phone,

            'company' => $request->company,

            'gstin' => $request->gstin,

            'website' => $request->website,

            'source' => $request->source,

            'address' => $request->address,

            'description' => $request->description,

            'pipeline_id' =>
            $request->pipeline_id,

            'stage_id' =>
            $request->stage_id,

            'value' => $request->value,

            'status' =>
            $request->status,

            /*
            |--------------------------------------------------------------------------
            | AUDIT
            |--------------------------------------------------------------------------
            */

            'updated_by' => $user->id,
        ]);

        return response()->json([

            'success' => true,

            'message' =>
            'Lead updated successfully',

            'data' => $lead->load([
                'pipeline',
                'stage',
                'assignedUser',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE LEAD
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        $id
    ) {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | FIND LEAD
        |--------------------------------------------------------------------------
        */

        $lead = $this->leadQuery($user)

            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | AUDIT
        |--------------------------------------------------------------------------
        */

        $lead->update([

            'deleted_by' => $user->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        $lead->delete();

        return response()->json([

            'success' => true,

            'message' =>
            'Lead deleted successfully',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGE STAGE
    |--------------------------------------------------------------------------
    */

    public function changeStage(
        Request $request
    ) {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $request->validate([

            'lead_id' => 'required',

            'stage_id' => 'required',
        ]);

        /*
        |--------------------------------------------------------------------------
        | FIND LEAD
        |--------------------------------------------------------------------------
        */

        $lead = $this->leadQuery($user)

            ->findOrFail(
                $request->lead_id
            );

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $lead->update([

            'stage_id' =>
            $request->stage_id,

            'updated_by' =>
            $user->id,
        ]);

        return response()->json([

            'success' => true,

            'message' =>
            'Lead stage updated',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGE status
    |--------------------------------------------------------------------------
    */

    public function changestatus(
        Request $request
    ) {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $request->validate([

            'lead_id' => 'required',

            'status' =>
            'required|in:hot,warm,cold',
        ]);

        /*
        |--------------------------------------------------------------------------
        | FIND LEAD
        |--------------------------------------------------------------------------
        */

        $lead = $this->leadQuery($user)

            ->findOrFail(
                $request->lead_id
            );

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $lead->update([

            'status' =>
            $request->status,

            'updated_by' =>
            $user->id,
        ]);

        return response()->json([

            'success' => true,

            'message' =>
            'Lead status updated',
        ]);
    }
}
