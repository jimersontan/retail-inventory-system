<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Models\Profile;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['user', 'branch', 'role', 'profile']);
        $user = $request->user();

        // Scope access
        if ($user->user_type === 'manager') {
            $query->where('branch_id', $user->employee->branch_id ?? null);
        } else if ($user->user_type === 'cashier') {
            return response()->json(['message' => 'Unauthorized Access'], 403);
        }

        // Apply filters
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('branch_id') && $request->branch_id != '') {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('role_id') && $request->role_id != '') {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('status') && $request->status != '') {
            if ($request->status !== 'all') {
                $query->where('status', $request->status);
            }
        }

        $employees = $query->paginate(15);
        return EmployeeResource::collection($employees);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();
        
        $employee = DB::transaction(function () use ($validated, $request) {
            $salary = 0;
            if ($request->user()->user_type === 'admin') {
                $salary = $validated['salary'] ?? 0;
            }

            // 1. Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'], 
                'user_type' => $validated['user_type'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);

            // 2. Create Employee
            $employee = Employee::create([
                'user_id' => $user->user_id,
                'branch_id' => $validated['branch_id'],
                'role_id' => $validated['role_id'],
                'position' => $validated['position'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
                'salary' => $salary,
                'status' => $validated['status'],
            ]);

            // 3. Create Profile
            Profile::create([
                'user_id' => $user->user_id,
                'employee_id' => $employee->employee_id,
                'phone_no' => $validated['profile_phone_no'] ?? null,
                'email' => $validated['profile_email'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'zip' => $validated['zip'] ?? null,
                'key_field' => $validated['key_field'] ?? null,
            ]);

            return $employee;
        });

        $employee->load(['user', 'branch', 'role', 'profile']);
        return response()->json(new EmployeeResource($employee), 201);
    }

    public function show($id, Request $request)
    {
        $employee = Employee::with(['user', 'branch', 'role', 'profile'])->findOrFail($id);
        $user = $request->user();

        if ($user->user_type === 'manager') {
            if ($employee->branch_id !== ($user->employee->branch_id ?? null)) {
                return response()->json(['message' => 'Unauthorized Access'], 403);
            }
        } else if ($user->user_type === 'cashier') {
             return response()->json(['message' => 'Unauthorized Access'], 403);
        }

        return new EmployeeResource($employee);
    }

    public function update(UpdateEmployeeRequest $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $employee, $request) {
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'user_type' => $validated['user_type'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = $validated['password'];
            }
            $employee->user->update($userData);

            $employeeData = [
                'branch_id' => $validated['branch_id'],
                'role_id' => $validated['role_id'],
                'position' => $validated['position'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
                'status' => $validated['status'],
            ];

            if ($request->user()->user_type === 'admin' && isset($validated['salary'])) {
                $employeeData['salary'] = $validated['salary'];
            }
            $employee->update($employeeData);

            $profileData = [
                'phone_no' => $validated['profile_phone_no'] ?? null,
                'email' => $validated['profile_email'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'zip' => $validated['zip'] ?? null,
                'key_field' => $validated['key_field'] ?? null,
            ];
            
            if ($employee->profile) {
                $employee->profile->update($profileData);
            } else {
                $profileData['employee_id'] = $employee->employee_id;
                Profile::create($profileData);
            }
        });

        $employee->load(['user', 'branch', 'role', 'profile']);
        return response()->json(new EmployeeResource($employee), 200);
    }

    public function toggleStatus($id)
    {
        $employee = Employee::findOrFail($id);
        
        if ($employee->status === 'active') {
            $employee->status = 'inactive';
        } else {
            $employee->status = 'active';
        }
        $employee->save();
        
        $msg = $employee->status === 'active' ? 'Employee activated' : 'Employee deactivated';
        
        return response()->json([
            'message' => $msg,
            'employee' => new EmployeeResource($employee)
        ]);
    }
}
