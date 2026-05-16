<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class LeadActivityController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ACTIVITY QUERY ACCESS
    |--------------------------------------------------------------------------
    */

    private function activityQuery($user)
    {
        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->type === 'superadmin') {

            return LeadActivity::query();
        }

        /*
        |--------------------------------------------------------------------------
        | SALES / INTERN
        |--------------------------------------------------------------------------
        */

        return LeadActivity::whereHas(
            'lead',
            function ($q) use ($user) {

                $q->where(
                    'created_by',
                    $user->id
                );
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LEAD ACCESS CHECK
    |--------------------------------------------------------------------------
    */

    private function leadAccess(
        $user,
        $leadId
    ) {

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->type === 'superadmin') {

            return Lead::findOrFail(
                $leadId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | OWNED LEADS ONLY
        |--------------------------------------------------------------------------
        */

        return Lead::where(
            'created_by',
            $user->id
        )
            ->findOrFail(
                $leadId
            );
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVITY LIST
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request
    ) {

        $user = $request->user();

        $query =
            $this->activityQuery(
                $user
            );

        /*
        |--------------------------------------------------------------------------
        | FILTER BY LEAD
        |--------------------------------------------------------------------------
        */

        if (
            $request->lead_id
        ) {

            $query->where(
                'lead_id',
                $request->lead_id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BY TYPE
        |--------------------------------------------------------------------------
        */

        if (
            $request->activity_type
        ) {

            $query->where(
                'activity_type',
                $request->activity_type
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if (
            $request->search
        ) {

            $query->where(
                'description',
                'LIKE',
                "%{$request->search}%"
            );
        }

        $activities =
            $query

            ->with([
                'lead',
                'creator'
            ])

            ->latest()

            ->paginate(
                $request->limit ?? 20
            );

        return response()->json([

            'success' => true,

            'data' =>
            $activities
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        $id
    ) {

        $user =
            $request->user();

        $activity =
            $this
            ->activityQuery(
                $user
            )

            ->with([
                'lead',
                'creator'
            ])

            ->findOrFail(
                $id
            );

        return response()->json([

            'success' => true,

            'data' =>
            $activity
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ) {

        $user =
            $request->user();

        $request->validate([

            'lead_id' =>
            'required|exists:leads,id',

            'activity_type' =>
            'required|in:call,email,whatsapp,meeting,note,followup,task',

            'description' =>
            'nullable|string',

            'outcome' =>
            'nullable|string',

            'next_action' =>
            'nullable|string',

            'activity_time' =>
            'nullable|date',

            'next_followup_at' =>
            'nullable|date'
        ]);

        /*
        |--------------------------------------------------------------------------
        | ACCESS CHECK
        |--------------------------------------------------------------------------
        */

        $this->leadAccess(
            $user,
            $request->lead_id
        );

        DB::beginTransaction();

        try {

            $activity =
                LeadActivity::create([

                    'lead_id' =>
                    $request->lead_id,

                    'activity_type' =>
                    $request->activity_type,

                    'description' =>
                    $request->description,

                    'outcome' =>
                    $request->outcome,

                    'next_action' =>
                    $request->next_action,

                    'activity_time' =>
                    $request->activity_time
                        ?? now(),

                    'next_followup_at' =>
                    $request->next_followup_at,

                    'created_by' =>
                    $user->id
                ]);

            DB::commit();

            return response()->json([

                'success' => true,

                'message' =>
                'Activity created successfully',

                'data' =>
                $activity->load([
                    'lead',
                    'creator'
                ])
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([

                'success' => false,

                'message' =>
                $e->getMessage()

            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        $id
    ) {

        $user =
            $request->user();

        $activity =
            $this
            ->activityQuery(
                $user
            )

            ->findOrFail(
                $id
            );

        $activity->update([
            'description' => $request->description,
            'activity_type' => $request->activity_type,
            'outcome' => $request->outcome,
            'next_action' => $request->next_action,
            'activity_time' => $request->activity_time,
            'next_followup_at' => $request->next_followup_at,
            'updated_by' => $user->id
        ]);

        return response()->json([

            'success' => true,

            'message' =>
            'Activity updated',

            'data' =>
            $activity
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        $id
    ) {

        $user =
            $request->user();

        $activity =
            $this
            ->activityQuery(
                $user
            )

            ->findOrFail(
                $id
            );

        $activity->update([

            'deleted_by' =>
            $user->id
        ]);

        $activity->delete();

        return response()->json([

            'success' => true,

            'message' =>
            'Activity deleted'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BULK DELETE
    |--------------------------------------------------------------------------
    */

    public function bulkDelete(
        Request $request
    ) {

        $user =
            $request->user();

        $request->validate([

            'ids' =>
            'required|array'
        ]);

        $activities =
            $this
            ->activityQuery(
                $user
            )

            ->whereIn(
                'id',
                $request->ids
            )

            ->get();

        foreach (
            $activities
            as $activity
        ) {

            $activity->update([

                'deleted_by' =>
                $user->id
            ]);

            $activity->delete();
        }

        return response()->json([

            'success' => true,

            'message' =>
            'Activities deleted'
        ]);
    }
}
