<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Services\InventoryService;
use App\Http\Requests\StockAdjustmentRequest;
use App\Http\Resources\InventoryResource;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected $inventory;

    // Injecting the singleton service into the constructor
    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function index(Request $request)
    {
        $query = Inventory::with(['product.category', 'branch']);

        // Cashier branch scoping vs Admin/Manager
        $user = auth()->user();
        if ($user->user_type === 'cashier') {
            $branchId = null;
            if ($user->employee) {
                $branchId = $user->employee->branch_id;
            }
            // Scopes to their branch exclusively
            if ($branchId) {
                $query->where('branch_id', $branchId);
            } else {
                $query->whereRaw('0 = 1');
            }
        } else {
            if ($request->has('branch_id') && $request->branch_id != '') {
                $query->where('branch_id', $request->branch_id);
            }
        }

        if ($request->has('category_id') && $request->category_id != '') {
            $query->whereHas('product', function($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        if ($request->has('search') && $request->search != '') {
            $term = $request->search;
            $query->whereHas('product', function($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('unique_sku', 'like', "%{$term}%");
            });
        }

        // Apply physical stock thresholds for SQL mapping logic based on accessor definitions mathematically Limits map
        if ($request->has('stock_level') && $request->stock_level != 'all') {
            $level = $request->stock_level;
            if ($level === 'out_of_stock') {
                $query->where('quantity', '<=', 0);
            } elseif ($level === 'low_stock') {
                $query->where('quantity', '>', 0)->where('quantity', '<=', 10);
            } elseif ($level === 'in_stock') {
                $query->where('quantity', '>', 10);
            }
        }

        $items = $query->paginate(20);
        return InventoryResource::collection($items);
    }

    public function show($id)
    {
        $inventory = Inventory::with([
            'product', 
            'branch', 
            'movements' => function($q) {
                $q->with('movedBy.user')->latest('movement_date')->take(10);
            }
        ])->findOrFail($id);

        return new InventoryResource($inventory);
    }

    public function adjust(StockAdjustmentRequest $request)
    {
        // Pushes all business manipulation variables down into the explicitly shielded Service layer limits boundaries constraints Boundary limit
        $this->inventory->adjust(
            $request->inventory_id,
            $request->quantity,
            $request->reason,
            $request->notes
        );

        $inv = Inventory::with(['product', 'branch'])->find($request->inventory_id);
        
        return response()->json(new InventoryResource($inv), 200);
    }
}
