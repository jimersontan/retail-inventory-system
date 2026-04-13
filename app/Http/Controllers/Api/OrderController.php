<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Requests\Payment\ConfirmPaymentRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    /**
     * Get orders with role-based filtering
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'branch', 'items.product', 'payment']);
        $user = $request->user();

        // Role-based access control
        if ($user->user_type === 'customer') {
            // Customers see only their own orders
            $query->where('user_id', $user->user_id);
        } elseif ($user->user_type === 'cashier') {
            // Cashiers see orders for their assigned branch
            $query->where('branch_id', $user->employee->branch_id ?? null);
        }
        // admin and manager see all orders

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('order_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('order_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('order_id', 'like', '%' . $term . '%')
                    ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', '%' . $term . '%'));
            });
        }

        $orders = $query->latest('order_date')->paginate(10);
        return OrderResource::collection($orders);
    }

    /**
     * Get a single order with full details
     */
    public function show($id, Request $request)
    {
        $order = Order::with(['user', 'branch', 'items.product', 'payment'])->findOrFail($id);
        $user = $request->user();

        // Access control
        if ($user->user_type === 'customer' && $order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->user_type === 'cashier' && $order->branch_id !== ($user->employee->branch_id ?? null)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new OrderResource($order);
    }

    /**
     * Place a new order (customer only)
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $order = DB::transaction(function () use ($validated, $user) {
            // Validate stock for all items before creating order
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    throw new \Exception('Product not found: ' . $item['product_id']);
                }

                $inventory = Inventory::where('product_id', $item['product_id'])
                    ->where('branch_id', $validated['branch_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || $inventory->quantity < $item['quantity']) {
                    $name = $product->name ?? 'Unknown';
                    throw new \Exception('Insufficient stock for ' . $name);
                }
            }

            // Calculate total amount
            $total_amount = collect($validated['items'])->sum(function ($item) {
                return $item['quantity'] * (float)$item['unit_price'];
            });

            // Create order
            $order = Order::create([
                'user_id' => $user->user_id,
                'branch_id' => $validated['branch_id'],
                'total_amount' => $total_amount,
                'status' => 'pending',
                'order_date' => now(),
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->order_id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
            }

            // Create payment record (pending)
            Payment::create([
                'order_id' => $order->order_id,
                'amount' => $total_amount,
                'status' => 'pending',
                'payment_date' => null,
            ]);

            return $order;
        });

        $order->load(['user', 'branch', 'items.product', 'payment']);

        // Notify Admins about new order
        $admins = User::where('user_type', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new SystemNotification(
                'New Order Placed',
                "Order #{$order->order_id} has been placed by {$user->name}.",
                'info'
            ));
        }

        return response()->json(new OrderResource($order), 201);
    }

    /**
     * Update order status with validation
     */
    public function updateStatus(UpdateOrderStatusRequest $request, $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $validated = $request->validated();
        $newStatus = $validated['status'];

        // Status machine validation
        $statusMachine = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['processing', 'cancelled'],
            'processing' => ['ready', 'cancelled'],
            'ready' => ['completed'],
            'completed' => [],
            'cancelled' => [],
        ];

        // Check if transition is allowed
        $allowedTransitions = $statusMachine[$order->status] ?? [];
        if (!in_array($newStatus, $allowedTransitions)) {
            return response()->json([
                'message' => "Cannot transition from {$order->status} to {$newStatus}"
            ], 422);
        }

        DB::transaction(function () use ($order, $newStatus) {
            // If marking as completed, deduct inventory and complete payment
            if ($newStatus === 'completed') {
                foreach ($order->items as $item) {
                    $inventory = Inventory::where('product_id', $item->product_id)
                        ->where('branch_id', $order->branch_id)
                        ->lockForUpdate()
                        ->first();

                    if ($inventory) {
                        // Use InventoryService to move stock out
                        $this->inventory->move(
                            $inventory->inventory_id,
                            $item->quantity,
                            'out',
                            'order',
                            $order->order_id
                        );
                    }
                }

                // Also mark payment as paid if it's currently pending
                $order->payment()->where('status', 'pending')->update([
                    'status' => 'paid',
                    'payment_date' => now()
                ]);
            }

            // If cancelling, refund payment
            if ($newStatus === 'cancelled') {
                $order->payment()->update(['status' => 'refunded']);
            }

            // Update order status
            $order->update(['status' => $newStatus]);
        });

        $order->load(['user', 'branch', 'items.product', 'payment']);

        // Notify customer about status update
        $order->user->notify(new SystemNotification(
            'Order Status Updated',
            "Your order #{$order->order_id} is now {$newStatus}.",
            'success'
        ));

        return new OrderResource($order);
    }

    /**
     * Cancel an order (customer - only own orders, if cancellable)
     */
    public function cancel($id, Request $request)
    {
        $order = Order::findOrFail($id);
        $user = $request->user();

        // Customer can only cancel their own orders
        if ($user->user_type === 'customer' && $order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if order is cancellable
        if (!$order->is_cancellable) {
            return response()->json([
                'message' => 'Order cannot be cancelled in ' . $order->status . ' status'
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->update(['status' => 'cancelled']);
            $order->payment()->update(['status' => 'refunded']);
        });

        $order->load(['user', 'branch', 'items.product', 'payment']);

        // Notify customer if they didn't cancel it themselves (though currently only they or admins can)
        $order->user->notify(new SystemNotification(
            'Order Cancelled',
            "Order #{$order->order_id} has been cancelled.",
            'error'
        ));

        return new OrderResource($order);
    }

    /**
     * Confirm payment (customer - for own order)
     */
    public function confirmPayment(ConfirmPaymentRequest $request, $id)
    {
        $order = Order::with('payment')->findOrFail($id);
        $user = $request->user();

        // Customer can only pay for their own order
        if ($order->user_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if payment is pending
        if ($order->payment->status !== 'pending') {
            return response()->json([
                'message' => 'Payment already ' . $order->payment->status
            ], 422);
        }

        $validated = $request->validated();

        // Update payment
        $order->payment()->update([
            'status' => 'paid',
            'payment_date' => now(),
        ]);

        $order->load(['user', 'branch', 'items.product', 'payment']);

        // Notify customer about payment confirmation
        $order->user->notify(new SystemNotification(
            'Payment Confirmed',
            "Payment for order #{$order->order_id} has been received.",
            'success'
        ));

        return new OrderResource($order);
    }
}
