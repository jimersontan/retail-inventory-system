<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Http\Requests\BranchRequest;
use App\Http\Resources\BranchResource;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->user_type === 'admin') {
            $branches = Branch::all();
        } else {
            // Manager/Cashier scoped to their own branch
            $branchId = $user->employee->branch_id ?? null;
            $branches = Branch::where('branch_id', $branchId)->get();
        }

        return BranchResource::collection($branches);
    }

    public function store(BranchRequest $request)
    {
        $branch = Branch::create($request->validated());
        return response()->json(new BranchResource($branch), 201);
    }

    public function show($id, Request $request)
    {
        $branch = Branch::with(['employees', 'inventory'])->findOrFail($id);
        $user = $request->user();

        // Enforce contextual view restrictions
        if ($user->user_type !== 'admin') {
            $userBranchId = $user->employee->branch_id ?? null;
            if ($branch->branch_id !== $userBranchId) {
                return response()->json(['message' => 'Unauthorized Access to this Branch'], 403);
            }
        }

        return new BranchResource($branch);
    }

    public function update(BranchRequest $request, $id)
    {
        $branch = Branch::findOrFail($id);
        $branch->update($request->validated());
        
        return response()->json(new BranchResource($branch), 200);
    }

    public function toggleActive($id)
    {
        $branch = Branch::findOrFail($id);
        
        // toggleActive logic - flip is_active 0<->1, NEVER hard delete
        $branch->is_active = !$branch->is_active;
        $branch->save();
        
        $msg = $branch->is_active ? 'Branch activated' : 'Branch deactivated';
        
        return response()->json([
            'message' => $msg,
            'branch' => new BranchResource($branch)
        ]);
    }
}
