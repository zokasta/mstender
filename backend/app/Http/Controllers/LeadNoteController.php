<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeadNote;
use App\Http\Controllers\Controller;

class LeadNoteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX NOTE
    |--------------------------------------------------------------------------
    */

    public function index($lead_id)
    {
        $notes = LeadNote::with([
            'comments.user',
            'user',
        ])
            ->where('lead_id', $lead_id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ADD NOTE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $note = LeadNote::create([
            'lead_id' => $request->lead_id,
            'title' => $request->title,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $note,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE NOTE
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $note = LeadNote::findOrFail($id);

        $note->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => $note,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE NOTE
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        LeadNote::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}