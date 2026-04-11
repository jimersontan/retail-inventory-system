<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Auth::user() returns Authenticatable, casting to User model
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->load(['employee.branch', 'employee.role']);
        
        $token = $user->createToken('ris-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => new UserResource($user)
        ], 200);
    }

    /**
     * Revoke current access token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Return current authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['employee.branch', 'employee.role']);
        
        return new UserResource($user);
    }
}
