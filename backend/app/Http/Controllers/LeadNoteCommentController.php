<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeadNoteComment;
use App\Http\Controllers\Controller;

class LeadNoteCommentController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ADD COMMENT
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $comment = LeadNoteComment::create([
            'lead_note_id' => $request->lead_note_id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'data' => $comment,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE COMMENT
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $comment = LeadNoteComment::findOrFail($id);

        $comment->update([
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'data' => $comment,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE COMMENT
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        LeadNoteComment::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}