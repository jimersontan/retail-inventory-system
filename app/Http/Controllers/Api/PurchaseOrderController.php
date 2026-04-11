<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrder\ReceiveItemsRequest;
use App\Http\Requests\PurchaseOrder\StorePORequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    protected $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function index(Request $request)
    {
        $query = PurchaseOrder::with([
            'supplier.user',
            'branch',
            'createdBy',
            'details.product',
        ]);

        $user = $request->user();
        if ($user->user_type === 'manager') {
            $branchId = optional(optional($user->employee)->branch)->branch_id ?? optional($user->employee)->branch_id;
            $query->where('branch_id', $branchId);
        }

        $query->byStatus($request->get('status'));
        $query->byBranch($request->get('branch_id'));

        if ($request->filled('date_from')) {
            $query->whereDate('order_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('order_date', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('po_id', 'like', '%' . $term . '%')
                    ->orWhereHas('supplier.user', function ($sq) use ($term) {
                        $sq->where('name', 'like', '%' . $term . '%');
                    })
                    ->orWhereHas('supplier', function ($sq) use ($term) {
                        $sq->where('store_name', 'like', '%' . $term . '%');
                    });
            });
        }

        $orders = $query->latest('po_id')->paginate(15);

        return PurchaseOrderResource::collection($orders);
    }

    public function store(StorePORequest $request)
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated, $request) {
            $po = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'branch_id' => $validated['branch_id'],
                'created_by' => $request->user()->user_id,
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'],
                'approved_case' => $validated['approved_case'] ?? null,
                'total_amount' => 0,
                'status' => 'draft',
            ]);

            $total = 0;
            foreach ($validated['items'] as $item) {
                $lineTotal = ((int) $item['quantity_ordered']) * ((float) $item['unit_price']);
                $total += $lineTotal;

                PurchaseOrderDetail::create([
                    'po_id' => $po->po_id,
                    'product_id' => $item['product_id'],
                    'quantity_ordered' => $item['quantity_ordered'],
                    'quantity_received' => 0,
                    'unit_price' => $item['unit_price'],
                ]);
            }

            $po->total_amount = $total;
            $po->save();

            return $po;
        });

        $order->load(['supplier.user', 'branch', 'createdBy', 'details.product']);

        return response()->json(new PurchaseOrderResource($order), 201);
    }

    public function show($id)
    {
        $order = PurchaseOrder::with(['supplier.user', 'branch', 'createdBy', 'details.product.category'])->findOrFail($id);

        return response()->json(new PurchaseOrderResource($order), 200);
    }

    public function update(StorePORequest $request, $id)
    {
        $order = PurchaseOrder::with('details')->findOrFail($id);

        if ($order->status !== 'draft') {
            return response()->json(['message' => 'Purchase order can only be edited while in draft status.'], 422);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $order) {
            $order->update([
                'supplier_id' => $validated['supplier_id'],
                'branch_id' => $validated['branch_id'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'],
                'approved_case' => $validated['approved_case'] ?? null,
            ]);

            $order->details()->delete();

            $total = 0;
            foreach ($validated['items'] as $item) {
                $lineTotal = ((int) $item['quantity_ordered']) * ((float) $item['unit_price']);
                $total += $lineTotal;

                PurchaseOrderDetail::create([
                    'po_id' => $order->po_id,
                    'product_id' => $item['product_id'],
                    'quantity_ordered' => $item['quantity_ordered'],
                    'quantity_received' => 0,
                    'unit_price' => $item['unit_price'],
                ]);
            }

            $order->total_amount = $total;
            $order->save();
        });

        $order->load(['supplier.user', 'branch', 'createdBy', 'details.product']);

        return response()->json(new PurchaseOrderResource($order), 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:sent',
        ]);

        $order = PurchaseOrder::findOrFail($id);

        // Status machine: draft -> sent only from this endpoint.
        if ($order->status !== 'draft') {
            return response()->json(['message' => 'Only draft purchase orders can be marked as sent.'], 422);
        }

        $order->status = 'sent';
        $order->save();

        return response()->json([
            'message' => 'Purchase order marked as sent.',
            'order' => new PurchaseOrderResource($order->load(['supplier.user', 'branch', 'createdBy', 'details.product'])),
        ], 200);
    }

    public function receive(ReceiveItemsRequest $request, $id)
    {
        $order = PurchaseOrder::with(['details', 'branch'])->findOrFail($id);

        if (!in_array($order->status, ['sent', 'partially_received'])) {
            return response()->json(['message' => 'Only sent or partially received purchase orders can receive items.'], 422);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $order) {
            foreach ($validated['items'] as $item) {
                $detail = $order->details->firstWhere('po_detail_id', (int) $item['po_detail_id']);
                if (!$detail) {
                    continue;
                }

                $receiveQty = (int) $item['quantity_received'];
                if ($receiveQty <= 0) {
                    continue;
                }

                $remaining = max(0, (int) $detail->quantity_ordered - (int) $detail->quantity_received);
                if ($receiveQty > $remaining) {
                    $receiveQty = $remaining;
                }
                if ($receiveQty <= 0) {
                    continue;
                }

                $detail->increment('quantity_received', $receiveQty);

                $inventory = Inventory::where('product_id', $detail->product_id)
                    ->where('branch_id', $order->branch_id)
                    ->first();

                if ($inventory) {
                    $this->inventory->move(
                        (int) $inventory->inventory_id,
                        $receiveQty,
                        'in',
                        'purchase_order',
                        (int) $order->po_id,
                        $validated['notes'] ?? null
                    );
                }
            }

            $order->refresh()->syncStatus();
        });

        $order->load(['supplier.user', 'branch', 'createdBy', 'details.product']);

        return response()->json([
            'message' => 'Items received successfully.',
            'order' => new PurchaseOrderResource($order),
        ], 200);
    }

    public function cancel($id)
    {
        $order = PurchaseOrder::findOrFail($id);

        // Cancel allowed from draft/sent/partially_received, but never from received.
        if ($order->status === 'received') {
            return response()->json(['message' => 'Received purchase orders cannot be cancelled.'], 422);
        }
        if (!in_array($order->status, ['draft', 'sent', 'partially_received'])) {
            return response()->json(['message' => 'Purchase order cannot be cancelled in current status.'], 422);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json([
            'message' => 'Purchase order cancelled.',
            'order' => new PurchaseOrderResource($order->load(['supplier.user', 'branch', 'createdBy', 'details.product'])),
        ], 200);
    }
}
