<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        return response()->json($notifications);
    }

    public function markRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->update([
            'is_read' => true,
            'updated_by' => $user->id,
        ]);

        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All marked as read']);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
