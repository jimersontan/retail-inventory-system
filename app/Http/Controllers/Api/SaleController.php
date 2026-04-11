<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Sale;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SaleController extends Controller
{
    protected $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function index(Request $request)
    {
        $query = Sale::with(['details.product', 'employee.user', 'branch']);
        $user = $request->user();

        if ($user->user_type === 'cashier') {
            $query->where('user_id', $user->user_id);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('sale_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('sale_date', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('sale_id', 'like', '%' . $term . '%')
                    ->orWhereHas('employee.user', function ($eq) use ($term) {
                        $eq->where('name', 'like', '%' . $term . '%');
                    });
            });
        }
        if ($request->filled('payment_method') && Schema::hasColumn('sales', 'payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->latest('sale_date')->paginate(20);
        return response()->json(SaleResource::collection($sales), 200);
    }

    public function store(StoreSaleRequest $request)
    {
        $user = $request->user();
        if (!in_array($user->user_type, ['admin', 'manager', 'cashier'])) {
            return response()->json(['message' => 'Unauthorized to create sales.'], 403);
        }

        if (!$user->employee || !$user->employee->branch_id) {
            return response()->json(['message' => 'User branch assignment is missing.'], 422);
        }

        $validated = $request->validated();
        $branchId = $user->employee->branch_id;

        $sale = DB::transaction(function () use ($validated, $user, $branchId) {
            // Stock validation before sale commit.
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                $inv = Inventory::where('product_id', $item['product_id'])
                    ->where('branch_id', $branchId)
                    ->lockForUpdate()
                    ->first();

                if (!$inv || $inv->quantity < $item['quantity']) {
                    $name = $product ? $product->name : 'Unknown product';
                    throw new \Exception('Insufficient stock for ' . $name);
                }
            }

            $payload = [
                'branch_id' => $branchId,
                'user_id' => $user->user_id,
                'employee_id' => $user->employee->employee_id,
                'sale_date' => now(),
                'total_amount' => collect($validated['items'])->sum(function ($item) {
                    return ((float) $item['unit_price']) * ((int) $item['quantity']);
                }),
            ];

            if (Schema::hasColumn('sales', 'payment_method')) {
                $payload['payment_method'] = $validated['payment_method'];
            }

            $sale = Sale::create($payload);

            foreach ($validated['items'] as $item) {
                $sale->details()->create($item);

                $inv = Inventory::where('product_id', $item['product_id'])
                    ->where('branch_id', $branchId)
                    ->first();

                $this->inventory->move(
                    (int) $inv->inventory_id,
                    (int) $item['quantity'],
                    'out',
                    'sale',
                    (int) $sale->sale_id,
                    'Payment: ' . $validated['payment_method']
                );
            }

            return $sale;
        });

        $sale->load(['details.product', 'employee.user', 'branch']);

        return response()->json([
            'message' => 'Sale recorded',
            'sale' => new SaleResource($sale),
        ], 201);
    }

    public function show($id)
    {
        $sale = Sale::with(['details.product', 'employee.user', 'branch', 'user'])->findOrFail($id);

        $user = auth()->user();
        if ($user->user_type === 'cashier' && (int) $sale->user_id !== (int) $user->user_id) {
            return response()->json(['message' => 'Unauthorized access to this sale.'], 403);
        }

        return response()->json(new SaleResource($sale), 200);
    }
}
