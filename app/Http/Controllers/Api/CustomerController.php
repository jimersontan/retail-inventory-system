<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    /**
     * List customers with filtering
     * Admin: all customers
     * Manager: customers in their branch
     */
    public function index()
    {
        $user = auth()->user();
        
        $query = Customer::with('user', 'branch');
        
        // Apply role-based filtering
        if ($user->user_type === 'manager') {
            $branchId = $user->branch_id ?? ($user->employee ? $user->employee->branch_id : null);
            $query->byBranch($branchId);
        }
        
        // Filter by status
        if (request('status')) {
            $query->byStatus(request('status'));
        }
        
        // Filter by verification status
        if (request('verified') !== null) {
            $query->verified(request('verified') === 'true');
        }
        
        // Filter by branch (admin only)
        if (request('branch_id') && $user->user_type === 'admin') {
            $query->byBranch(request('branch_id'));
        }
        
        // Search by name, email, store name
        if (request('search')) {
            $search = request('search');
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('store_name', 'like', "%{$search}%");
        }
        
        $customers = $query->paginate(15);
        
        return response()->json([
            'data' => CustomerResource::collection($customers),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
                'per_page' => $customers->perPage(),
            ],
        ]);
    }

    /**
     * Create new customer (registration flow)
     * DB::transaction: User + Customer created atomically
     */
    public function store(StoreCustomerRequest $req)
    {
        $data = $req->validated();
        
        $customer = DB::transaction(function () use ($data) {
            // Create User record
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'user_type' => 'customer',
            ]);
            
            // Create Customer record (status: pending_verification)
            $customer = Customer::create([
                'user_id' => $user->user_id,
                'branch_id' => $data['branch_id'],
                'store_name' => $data['store_name'] ?? null,
                'status' => 'pending_verification',
                'joined_at' => now(),
            ]);
            
            return $customer;
        });
        
        return response()->json(
            new CustomerResource($customer->load('user', 'branch')),
            201
        );
    }

    /**
     * Show customer details
     */
    public function show($id)
    {
        $user = auth()->user();
        $customer = Customer::with('user', 'branch', 'listings.product', 'orders', 'reviews')->find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
        
        // Manager can only view customers in their branch
        if ($user->user_type === 'manager' && $customer->branch_id !== ($user->employee ? $user->employee->branch_id : null)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json(new CustomerResource($customer));
    }

    /**
     * Update customer profile
     */
    public function update($id, UpdateCustomerRequest $req)
    {
        $user = auth()->user();
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
        
        // Manager can only edit customers in their branch
        if ($user->user_type === 'manager' && $customer->branch_id !== ($user->employee ? $user->employee->branch_id : null)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $data = $req->validated();
        
        DB::transaction(function () use ($customer, $data) {
            // Update User fields
            if (isset($data['name'])) {
                $customer->user->name = $data['name'];
            }
            if (isset($data['email'])) {
                $customer->user->email = $data['email'];
            }
            if (isset($data['phone'])) {
                $customer->user->phone = $data['phone'];
            }
            if (isset($data['address'])) {
                $customer->user->address = $data['address'];
            }
            $customer->user->save();
            
            // Update Customer fields
            if (isset($data['store_name'])) {
                $customer->store_name = $data['store_name'];
            }
            $customer->save();
        });
        
        return response()->json(new CustomerResource($customer->load('user', 'branch')));
    }

    /**
     * Update authenticated customer's own profile
     */
    public function updateProfile(UpdateCustomerRequest $req)
    {
        $user = auth()->user();
        $customer = $user->customer;
        
        if (!$customer) {
            return response()->json(['message' => 'Customer profile not found'], 404);
        }
        
        $data = $req->validated();
        
        DB::transaction(function () use ($customer, $data) {
            // Update User fields
            if (isset($data['name'])) {
                $customer->user->name = $data['name'];
            }
            if (isset($data['phone'])) {
                $customer->user->phone = $data['phone'];
            }
            if (isset($data['address'])) {
                $customer->user->address = $data['address'];
            }
            $customer->user->save();
            
            // Update Customer fields
            if (isset($data['store_name'])) {
                $customer->store_name = $data['store_name'];
            }
            $customer->save();
        });
        
        return response()->json(new CustomerResource($customer->load('user', 'branch')));
    }

    /**
     * Verify customer account (admin only)
     * Sets verified_at = now(), status = active
     */
    public function verify($id)
    {
        $user = auth()->user();
        if ($user->user_type !== 'admin') {
            return response()->json(['message' => 'Only admins can verify customers'], 403);
        }
        
        $customer = Customer::find($id);
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
        
        $customer->verified_at = now();
        $customer->status = 'active';
        $customer->save();
        
        return response()->json(new CustomerResource($customer->load('user', 'branch')));
    }

    /**
     * Toggle customer status (admin only)
     * Toggles between active and inactive
     */
    public function toggleStatus($id)
    {
        $user = auth()->user();
        if ($user->user_type !== 'admin') {
            return response()->json(['message' => 'Only admins can change customer status'], 403);
        }
        
        $customer = Customer::find($id);
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
        
        // Toggle between active and inactive
        $customer->status = $customer->status === 'active' ? 'inactive' : 'active';
        $customer->save();
        
        return response()->json(new CustomerResource($customer->load('user', 'branch')));
    }
}
