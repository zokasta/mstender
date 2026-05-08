<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Login and issue a Bearer token
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        if ($user->is_banned || $user->status !== 'active') {
            return response()->json(['message' => 'Your account is inactive or banned', 'status-key' => 'account-banned'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $user->update([
            'last_login_at' => now(),
            'last_ip_address' => $request->ip(),
        ]);


        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Logout (invalidate token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get currently authenticated user
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Get authenticated user profile
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'username' => 'required|string|max:150',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            // 'theme' => 'nullable|in:light,dark',
            // 'notifications' => 'boolean',
        ]);

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profiles', 'public');
            $validated['profile_image'] = Storage::url($path);
        }

        $user->update($validated);

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Update Setting
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'settings' => 'required|array'
        ]);

        $user->update([
            'settings' => $validated['settings']
        ]);

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $user->settings
        ]);
    }
}
