<?php

namespace App\Http\Middlewares;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIfUserIsBanned
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If not logged in, continue (auth middleware will handle it)
        if (!$user) {
            return $next($request);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'Your account is inactive by admin',
                'status_key' => 'account-banned'
            ], 403);
        }

        return $next($request);
    }
}
