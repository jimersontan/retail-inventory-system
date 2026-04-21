<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->load(['employee.branch', 'employee.role', 'customer']);
        
        $token = $user->createToken('ris-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => new UserResource($user)
        ], 200);
    }

    /**
     * Register a new customer account (public).
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'phone'                 => 'required|string|max:20',
            'address'               => 'required|string|max:500',
            'branch_id'             => 'required|exists:branches,branch_id',
            'store_name'            => 'nullable|string|max:255',
        ], [
            'email.unique'          => 'An account with this email already exists.',
            'password.confirmed'    => 'Passwords do not match.',
            'password.min'          => 'Password must be at least 8 characters.',
            'branch_id.required'    => 'Please select a preferred branch.',
            'branch_id.exists'      => 'The selected branch is invalid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name'      => $data['name'],
                'email'     => $data['email'],
                'password'  => Hash::make($data['password']),
                'phone'     => $data['phone'],
                'address'   => $data['address'],
                'user_type' => 'customer',
            ]);

            Customer::create([
                'user_id'    => $user->user_id,
                'branch_id'  => $data['branch_id'],
                'store_name' => $data['store_name'] ?? null,
                'status'     => 'pending_verification',
                'joined_at'  => now(),
            ]);

            return $user;
        });

        $user->load('customer');
        $token = $user->createToken('ris-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful! Your account is pending admin verification.',
            'token'   => $token,
            'user'    => new UserResource($user),
        ], 201);
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
        $user = $request->user()->load(['employee.branch', 'employee.role', 'customer']);
        
        return new UserResource($user);
    }
}
