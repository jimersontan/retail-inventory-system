<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkAdjustmentRequest;
use App\Models\StockMovement;
use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StockAdjustmentController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Get all stock adjustments with filtering and statistics
     * 
     * Filters:
     * - branch_id: filter by branch (admin only)
     * - reason: adjustment reason (damaged, theft, etc.)
     * - type: in or out
     * - date_from & date_to: date range
     * - moved_by: user search
     * - product_id: filter by product
     * - search: search by product name or SKU
     */
    public function index()
    {
        $user = Auth::user();
        $page = request()->query('page', 1);
        $perPage = 15;

        // Start query: get all stock movements of type 'adjustment'
        $query = StockMovement::where('reference_type', 'adjustment')
            ->with(['inventory.product', 'inventory.branch', 'movedBy.user']);

        // Branch filtering: manager sees only own branch, admin sees all
        if ($user->hasRole('manager')) {
            $userBranchId = ($user->employee && $user->employee->branch_id) ? $user->employee->branch_id : null;
            if ($userBranchId) {
                $query->whereHas('inventory.branch', function ($q) use ($userBranchId) {
                    $q->where('branch_id', $userBranchId);
                });
            }
        }

        // Filter by branch (admin only)
        if (request()->has('branch_id') && $user->hasRole('admin')) {
            $query->whereHas('inventory.branch', function ($q) {
                $q->where('branch_id', request()->query('branch_id'));
            });
        }

        // Filter by movement type (in/out)
        if (request()->has('type')) {
            $query->where('movement_type', request()->query('type'));
        }

        // Filter by date range
        if (request()->has('date_from')) {
            $query->whereDate('movement_date', '>=', request()->query('date_from'));
        }
        if (request()->has('date_to')) {
            $query->whereDate('movement_date', '<=', request()->query('date_to'));
        }

        // Filter by moved_by user (search by name)
        if (request()->has('moved_by')) {
            $query->whereHas('movedBy.user', function ($q) {
                $q->where('name', 'like', '%' . request()->query('moved_by') . '%');
            });
        }

        // Filter by product (name or SKU)
        if (request()->has('search')) {
            $search = request()->query('search');
            $query->whereHas('inventory.product', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('unique_sku', 'like', "%$search%");
            });
        }

        // Filter by adjustment reason (stored in notes field, format: "reason: {reason_name}")
        if (request()->has('reason')) {
            $reason = request()->query('reason');
            $query->where('notes', 'like', "%$reason%");
        }

        // Get stats BEFORE pagination
        $totalCount = $query->count();
        $todayCount = (clone $query)->whereDate('movement_date', today())->count();
        $totalInQty = (clone $query)->where('movement_type', 'in')->sum('quantity');
        $totalOutQty = (clone $query)->where('movement_type', 'out')->sum('quantity');

        // Paginate
        $adjustments = $query->orderBy('movement_date', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform each adjustment to include helpful data
        $data = collect($adjustments->items())->map(function ($movement) {
            return [
                'movement_id' => $movement->movement_id,
                'inventory_id' => $movement->inventory_id,
                'movement_type' => $movement->movement_type,
                'quantity' => $movement->quantity,
                'movement_time' => ($movement->movement_date) ? $movement->movement_date->toIso8601String() : null,
                'notes' => $movement->notes,
                'product' => ($movement->inventory && $movement->inventory->product) ? [
                    'product_id' => $movement->inventory->product->product_id,
                    'name' => $movement->inventory->product->name,
                    'unique_sku' => $movement->inventory->product->unique_sku,
                ] : null,
                'branch' => ($movement->inventory && $movement->inventory->branch) ? [
                    'branch_id' => $movement->inventory->branch->branch_id,
                    'name' => $movement->inventory->branch->name,
                ] : null,
                'current_qty' => ($movement->inventory) ? $movement->inventory->quantity : 0,
                'moved_by' => ($movement->movedBy && $movement->movedBy->user) ? [
                    'user_id' => $movement->movedBy->user->user_id,
                    'name' => $movement->movedBy->user->name,
                    'initials' => $this->getInitials($movement->movedBy->user->name),
                ] : null,
            ];
        });

        return response()->json([
            'data' => $data->toArray(),
            'pagination' => [
                'total' => $adjustments->total(),
                'per_page' => $adjustments->perPage(),
                'current_page' => $adjustments->currentPage(),
                'last_page' => $adjustments->lastPage(),
                'from' => $adjustments->firstItem(),
                'to' => $adjustments->lastItem(),
            ],
            'stats' => [
                'total_adjustments' => $totalCount,
                'today_count' => $todayCount,
                'total_in_qty' => $totalInQty,
                'total_out_qty' => $totalOutQty,
            ],
        ], 200);
    }

    /**
     * Create bulk stock adjustments in a single transaction
     * 
     * TRANSACTION LOGIC:
     * 1. Lock each inventory record FOR UPDATE to prevent concurrent updates
     * 2. Validate each item:
     *    - If type=out: check current quantity >= adjustment quantity
     *    - Throw exception if validation fails
     * 3. Call InventoryService->adjust() for each item
     *    - InventoryService writes to stock_movements table
     *    - If ANY exception occurs, entire transaction rolls back
     * 4. Return success response with adjustment count
     * 
     * If transaction fails, HTTP response will be 422 with error details
     */
    public function store(BulkAdjustmentRequest $req)
    {
        $user = Auth::user();

        // Manager can only adjust their own branch
        if ($user->hasRole('manager')) {
            $branchId = ($user->employee && $user->employee->branch_id) ? $user->employee->branch_id : null;
            if ($req->branch_id != $branchId) {
                return response()->json([
                    'message' => 'Managers can only adjust inventory in their assigned branch',
                ], 403);
            }
        }

        try {
            // TRANSACTION: All adjustments succeed together or all fail together
            DB::transaction(function () use ($req, $user) {
                foreach ($req->items as $item) {
                    // Lock inventory record to prevent concurrent updates
                    $inventory = Inventory::lockForUpdate()
                        ->find($item['inventory_id']);

                    // Validate: if removing, ensure sufficient stock exists
                    if ($item['type'] === 'out' && $inventory->quantity < $item['quantity']) {
                        throw new \Exception(
                            "Insufficient stock for product {$inventory->product->name}. " .
                            "Current: {$inventory->quantity}, Requested to remove: {$item['quantity']}"
                        );
                    }

                    // Call InventoryService to perform the adjustment
                    // This handles: update Inventory, create StockMovement record
                    $quantity = $item['type'] === 'in' ? $item['quantity'] : -$item['quantity'];
                    
                    // Combine item notes with global notes
                    $notes = '';
                    if (!empty($item['notes'])) {
                        $notes .= $item['notes'];
                    }
                    if (!empty($req->notes)) {
                        $notes .= ($notes ? ' | ' : '') . $req->notes;
                    }

                    // Call InventoryService.adjust(inventoryId, signedQty, reason, notes)
                    // The InventoryService will format the reason into the notes
                    $this->inventoryService->adjust(
                        $inventory->inventory_id,
                        $quantity,
                        $req->reason,
                        $notes ?: null
                    );
                }
            });

            return response()->json([
                'message' => count($req->items) . ' adjustment(s) applied successfully',
                'adjusted_count' => count($req->items),
            ], 200);
        } catch (\Exception $e) {
            // Transaction rolled back automatically; return error response
            return response()->json([
                'message' => 'Adjustment failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Helper: Extract initials from name
     */
    private function getInitials($name)
    {
        $parts = explode(' ', trim($name));
        $initials = '';
        foreach ($parts as $part) {
            $initials .= strtoupper($part[0]);
        }
        return $initials;
    }
}
