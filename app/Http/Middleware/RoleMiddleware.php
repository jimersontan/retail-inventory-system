<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Case-insensitive match so DB values like "Admin" still align with route middleware "admin"
        $userType = strtolower((string) auth()->user()->user_type);
        $normalizedRoles = array_map(function ($role) {
            return strtolower((string) $role);
        }, $roles);

        if (!in_array($userType, $normalizedRoles, true)) {
            return response()->json([
                'message' => 'Forbidden. Required role: ' . implode(' or ', $roles)
            ], 403);
        }

        return $next($request);
    }
}
