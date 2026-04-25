<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $user = auth()->user();
        $isManager = $user->hasRole('manager');
        $userBranchId = $isManager ? (($user->employee) ? $user->employee->branch_id : null) : null;

        $from = $request->from ? Carbon::parse($request->from)->startOfDay() : Carbon::now()->startOfMonth();
        $to = $request->to ? Carbon::parse($request->to)->endOfDay() : Carbon::now();

        try {
            // Unified data source for revenue and transactions
            $posSource = DB::table('sales')
                ->selectRaw('total_amount, branch_id, sale_date as date, COALESCE(payment_method, "cash") as method')
                ->whereBetween('sale_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId));

            $orderSource = DB::table('orders')
                ->leftJoin('payments', 'orders.order_id', '=', 'payments.order_id')
                ->selectRaw('orders.total_amount, orders.branch_id, orders.order_date as date, COALESCE(payments.payment_method, "cash") as method')
                ->whereIn('orders.status', ['completed', 'delivered'])
                ->whereBetween('orders.order_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('orders.branch_id', $userBranchId));

            $unified = DB::query()->fromSub($posSource->unionAll($orderSource), 'u');

            // Summary cards
            $summary = [
                'total_revenue' => round((float)$unified->sum('total_amount'), 2),
                'total_transactions' => (int)$unified->count(),
                'avg_sale' => round((float)($unified->avg('total_amount') ?? 0), 2),
                'total_items_sold' => (int)(
                    DB::table('sale_details')
                        ->join('sales', 'sale_details.sale_id', '=', 'sales.sale_id')
                        ->whereBetween('sales.sale_date', [$from, $to])
                        ->when($userBranchId, fn($q) => $q->where('sales.branch_id', $userBranchId))
                        ->sum('sale_details.quantity') +
                    DB::table('order_items')
                        ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
                        ->whereIn('orders.status', ['completed', 'delivered'])
                        ->whereBetween('orders.order_date', [$from, $to])
                        ->when($userBranchId, fn($q) => $q->where('orders.branch_id', $userBranchId))
                        ->sum('order_items.quantity')
                ),
            ];

            // Sales by branch
            $byBranch = DB::query()
                ->fromSub($unified, 'u')
                ->join('branches', 'u.branch_id', '=', 'branches.branch_id')
                ->selectRaw('branches.name as branch, SUM(u.total_amount) as revenue, COUNT(*) as count')
                ->groupBy('branches.branch_id', 'branches.name')
                ->orderByDesc('revenue')
                ->get()
                ->map(fn($item) => [
                    'branch' => $item->branch,
                    'revenue' => (float)$item->revenue,
                    'count' => (int)$item->count
                ]);

            // Daily breakdown
            $byDay = DB::query()
                ->fromSub($unified, 'u')
                ->selectRaw('DATE(u.date) as date, COUNT(*) as transactions, SUM(u.total_amount) as revenue')
                ->selectRaw('SUM(CASE WHEN method = "cash" THEN total_amount ELSE 0 END) as cash_amount')
                ->selectRaw('SUM(CASE WHEN method = "card" THEN total_amount ELSE 0 END) as card_amount')
                ->selectRaw('SUM(CASE WHEN method = "gcash" THEN total_amount ELSE 0 END) as gcash_amount')
                ->groupBy(DB::raw('DATE(u.date)'))
                ->orderBy('date')
                ->paginate(20);

            // Payment methods breakdown
            $byPayment = DB::query()
                ->fromSub($unified, 'u')
                ->selectRaw('method, SUM(total_amount) as amount, COUNT(*) as count')
                ->groupBy('method')
                ->get()
                ->map(function($item) {
                    $colors = ['cash' => '#10B981', 'card' => '#4F46E5', 'gcash' => '#F59E0B'];
                    return [
                        'method' => ucfirst($item->method),
                        'amount' => (float)$item->amount,
                        'count' => (int)$item->count,
                        'color' => $colors[$item->method] ?? '#8B5CF6'
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => $summary,
                    'by_branch' => $byBranch,
                    'by_day' => $byDay,
                    'by_payment' => $byPayment,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function inventory(Request $request)
    {
        $user = auth()->user();
        $isManager = $user->hasRole('manager');
        $userBranchId = $isManager ? (($user->employee) ? $user->employee->branch_id : null) : null;

        try {
            // Summary
            $summary = [
                'total_skus' => DB::table('products')->count(),
                
                'total_units' => DB::table('inventory')
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->sum('quantity') ?? 0,
                
                'low_stock' => DB::table('inventory')
                    ->where('quantity', '>', 0)
                    ->where('quantity', '<=', 10)
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->count(),
                
                'out_of_stock' => DB::table('inventory')
                    ->where('quantity', 0)
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->count(),
            ];

            // By category (BarChart - grouped columns)
            $byCategory = DB::table('inventory')
                ->join('products', 'inventory.product_id', '=', 'products.product_id')
                ->join('categories', 'products.category_id', '=', 'categories.category_id')
                ->selectRaw('categories.category_name')
                ->selectRaw('SUM(CASE WHEN inventory.quantity > 10 THEN inventory.quantity ELSE 0 END) as in_stock')
                ->selectRaw('SUM(CASE WHEN inventory.quantity BETWEEN 1 AND 10 THEN inventory.quantity ELSE 0 END) as low_stock')
                ->selectRaw('SUM(CASE WHEN inventory.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock')
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->groupBy('categories.category_id', 'categories.category_name')
                ->get()
                ->map(fn($item) => [
                    'category' => $item->category_name,
                    'in_stock' => (int)$item->in_stock,
                    'low_stock' => (int)$item->low_stock,
                    'out_of_stock' => (int)$item->out_of_stock
                ]);

            // Full inventory list (paginated)
            $fullList = DB::table('inventory')
                ->join('products', 'inventory.product_id', '=', 'products.product_id')
                ->join('categories', 'products.category_id', '=', 'categories.category_id')
                ->join('branches', 'inventory.branch_id', '=', 'branches.branch_id')
                ->select(
                    'products.name',
                    'products.unique_sku',
                    'categories.category_name',
                    'branches.name as branch',
                    'inventory.quantity',
                    'inventory.max_stock'
                )
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->orderBy('products.name')
                ->paginate(20);

            $fullList->getCollection()->transform(function($item) {
                $fillPercent = $item->max_stock > 0 ? ($item->quantity / $item->max_stock) * 100 : 0;
                return (object)array_merge((array)$item, [
                    'fill_percent' => (int)$fillPercent,
                    'status' => $item->quantity == 0 ? 'out_of_stock' : ($item->quantity <= 10 ? 'low_stock' : 'in_stock')
                ]);
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => $summary,
                    'by_category' => $byCategory,
                    'full_list' => $fullList,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function purchases(Request $request)
    {
        $user = auth()->user();
        $isManager = $user->hasRole('manager');
        $userBranchId = $isManager ? (($user->employee) ? $user->employee->branch_id : null) : null;

        $from = $request->from ? Carbon::parse($request->from)->startOfDay() : Carbon::now()->startOfMonth();
        $to = $request->to ? Carbon::parse($request->to)->endOfDay() : Carbon::now();

        try {
            // Summary
            $summary = [
                'total_pos' => DB::table('purchase_orders')
                    ->whereBetween('order_date', [$from, $to])
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->count(),
                
                'total_amount' => DB::table('purchase_orders')
                    ->whereBetween('order_date', [$from, $to])
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->sum('total_amount') ?? 0,
                
                'pending_pos' => DB::table('purchase_orders')
                    ->where('status', 'pending')
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->count(),
                
                'completed_pos' => DB::table('purchase_orders')
                    ->where('status', 'completed')
                    ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                    ->count(),
            ];

            // By status (PieChart)
            $byStatus = DB::table('purchase_orders')
                ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as amount')
                ->whereBetween('order_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('branch_id', $userBranchId))
                ->groupBy('status')
                ->get()
                ->map(function($item) {
                    $colors = [
                        'pending' => '#F59E0B', 
                        'approved' => '#6366F1', 
                        'received' => '#10B981', 
                        'completed' => '#10B981', 
                        'cancelled' => '#EF4444'
                    ];
                    return [
                        'status' => ucfirst($item->status),
                        'count' => (int)$item->count,
                        'amount' => (float)$item->amount,
                        'color' => $colors[$item->status] ?? '#8B5CF6'
                    ];
                });

            // PO list (paginated)
            $poList = DB::table('purchase_orders')
                ->join('branches', 'purchase_orders.branch_id', '=', 'branches.branch_id')
                ->select(
                    'purchase_orders.po_id',
                    'purchase_orders.supplier_id',
                    'purchase_orders.order_date',
                    'purchase_orders.total_amount',
                    'purchase_orders.status',
                    'branches.name as branch'
                )
                ->whereBetween('purchase_orders.order_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('purchase_orders.branch_id', $userBranchId))
                ->orderByDesc('order_date')
                ->paginate(15);

            $poList->getCollection()->transform(function($item) {
                $itemCount = DB::table('purchase_order_details')
                    ->where('po_id', $item->po_id)
                    ->count();
                return (object)array_merge((array)$item, ['item_count' => $itemCount]);
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => $summary,
                    'by_status' => $byStatus,
                    'po_list' => $poList,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function movements(Request $request)
    {
        $user = auth()->user();
        $isManager = $user->hasRole('manager');
        $userBranchId = $isManager ? (($user->employee) ? $user->employee->branch_id : null) : null;

        $from = $request->from ? Carbon::parse($request->from)->startOfDay() : Carbon::now()->startOfMonth();
        $to = $request->to ? Carbon::parse($request->to)->endOfDay() : Carbon::now();

        try {
            // Summary
            $totalMovements = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->count();

            $totalIn = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->whereIn('stock_movements.reference_type', ['purchase_order', 'adjustment'])
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->sum('stock_movements.quantity') ?? 0;

            $totalOut = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->whereIn('stock_movements.reference_type', ['sale', 'order'])
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->sum('stock_movements.quantity') ?? 0;

            $adjustments = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->where('stock_movements.reference_type', 'adjustment')
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->count();

            $summary = [
                'total_movements' => $totalMovements,
                'total_in' => (int)$totalIn,
                'total_out' => (int)$totalOut,
                'adjustments' => $adjustments,
            ];

            // Over time (LineChart - 2 lines: in & out)
            $overTime = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->selectRaw('DATE(stock_movements.movement_date) as date')
                ->selectRaw('SUM(CASE WHEN stock_movements.reference_type IN ("purchase_order", "adjustment") THEN stock_movements.quantity ELSE 0 END) as stock_in')
                ->selectRaw('SUM(CASE WHEN stock_movements.reference_type IN ("sale", "order") THEN stock_movements.quantity ELSE 0 END) as stock_out')
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->groupBy(DB::raw('DATE(stock_movements.movement_date)'))
                ->orderBy('date')
                ->get()
                ->map(fn($item) => [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'stock_in' => (int)$item->stock_in,
                    'stock_out' => (int)$item->stock_out
                ]);

            // By type (table)
            $byType = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->selectRaw('reference_type as movement_type, COUNT(*) as count, SUM(stock_movements.quantity) as total_qty')
                ->selectRaw('COUNT(DISTINCT inventory.product_id) as products_affected')
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->groupBy('reference_type')
                ->orderByDesc('total_qty')
                ->get()
                ->map(fn($item) => [
                    'type' => ucfirst(str_replace('_', ' ', $item->movement_type)),
                    'count' => (int)$item->count,
                    'total_qty' => (int)$item->total_qty,
                    'products_affected' => (int)$item->products_affected
                ]);

            // Recent detailed movements
            $fullList = DB::table('stock_movements')
                ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
                ->join('products', 'inventory.product_id', '=', 'products.product_id')
                ->join('branches', 'inventory.branch_id', '=', 'branches.branch_id')
                ->select(
                    'stock_movements.movement_date as date',
                    'products.name as product_name',
                    'stock_movements.reference_type as type',
                    'stock_movements.quantity',
                    'branches.name as branch'
                )
                ->whereBetween('stock_movements.movement_date', [$from, $to])
                ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
                ->orderByDesc('stock_movements.movement_date')
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => $summary,
                    'over_time' => $overTime,
                    'by_type' => $byType,
                    'full_list' => $fullList
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function export(Request $request)
    {
        $user = auth()->user();
        $isManager = $user->hasRole('manager');
        $userBranchId = $isManager ? (($user->employee) ? $user->employee->branch_id : null) : null;

        $type = $request->type ?? 'sales';
        $from = $request->from ? Carbon::parse($request->from)->startOfDay() : Carbon::now()->startOfMonth();
        $to = $request->to ? Carbon::parse($request->to)->endOfDay() : Carbon::now();

        try {
            $filename = "ris_{$type}_report_" . now()->format('Y-m-d_H-i-s') . '.csv';

            return response()->streamDownload(function() use ($type, $from, $to, $userBranchId) {
                $out = fopen('php://output', 'w');

                switch($type) {
                    case 'sales':
                        $this->exportSales($out, $from, $to, $userBranchId);
                        break;
                    case 'inventory':
                        $this->exportInventory($out, $userBranchId);
                        break;
                    case 'purchases':
                        $this->exportPurchases($out, $from, $to, $userBranchId);
                        break;
                    case 'movements':
                        $this->exportMovements($out, $from, $to, $userBranchId);
                        break;
                }

                fclose($out);
            }, $filename, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\""
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function exportSales($out, $from, $to, $userBranchId)
    {
        fputcsv($out, ['Date', 'Branch', 'Revenue', 'Transactions', 'Avg Sale', 'Cash', 'Card', 'GCash']);

        DB::table('sales')
            ->join('branches', 'sales.branch_id', '=', 'branches.branch_id')
            ->selectRaw('DATE(sales.sale_date) as date, branches.name')
            ->selectRaw('SUM(sales.total_amount) as revenue, COUNT(*) as count, AVG(sales.total_amount) as avg')
            ->selectRaw('SUM(CASE WHEN sales.payment_method = "cash" THEN sales.total_amount ELSE 0 END) as cash')
            ->selectRaw('SUM(CASE WHEN sales.payment_method = "card" THEN sales.total_amount ELSE 0 END) as card')
            ->selectRaw('SUM(CASE WHEN sales.payment_method = "gcash" THEN sales.total_amount ELSE 0 END) as gcash')
            ->whereBetween('sales.sale_date', [$from, $to])
            ->when($userBranchId, fn($q) => $q->where('sales.branch_id', $userBranchId))
            ->groupBy('date', 'branches.branch_id', 'branches.name')
            ->orderBy('date')
            ->chunk(100, function($rows) use ($out) {
                foreach ($rows as $row) {
                    fputcsv($out, [
                        $row->date,
                        $row->name,
                        number_format($row->revenue, 2),
                        $row->count,
                        number_format($row->avg, 2),
                        number_format($row->cash, 2),
                        number_format($row->card, 2),
                        number_format($row->gcash, 2),
                    ]);
                }
            });
    }

    private function exportInventory($out, $userBranchId)
    {
        fputcsv($out, ['Product', 'SKU', 'Category', 'Branch', 'Quantity', 'Max Stock', 'Fill %', 'Status']);

        DB::table('inventory')
            ->join('products', 'inventory.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->join('branches', 'inventory.branch_id', '=', 'branches.branch_id')
            ->select(
                'products.name',
                'products.unique_sku',
                'categories.category_name',
                'branches.name as branch',
                'inventory.quantity',
                'inventory.max_stock'
            )
            ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
            ->orderBy('products.name')
            ->chunk(100, function($rows) use ($out) {
                foreach ($rows as $row) {
                    $fillPercent = $row->max_stock > 0 ? ($row->quantity / $row->max_stock) * 100 : 0;
                    $status = $row->quantity == 0 ? 'Out of Stock' : ($row->quantity <= 10 ? 'Low Stock' : 'In Stock');
                    fputcsv($out, [
                        $row->name,
                        $row->unique_sku,
                        $row->category_name,
                        $row->branch,
                        $row->quantity,
                        $row->max_stock,
                        number_format($fillPercent, 1),
                        $status
                    ]);
                }
            });
    }

    private function exportPurchases($out, $from, $to, $userBranchId)
    {
        fputcsv($out, ['PO #', 'Supplier ID', 'Branch', 'Date', 'Items', 'Amount', 'Status']);

        DB::table('purchase_orders')
            ->join('branches', 'purchase_orders.branch_id', '=', 'branches.branch_id')
            ->select(
                'purchase_orders.po_id',
                'purchase_orders.supplier_id',
                'branches.name',
                'purchase_orders.order_date',
                'purchase_orders.total_amount',
                'purchase_orders.status'
            )
            ->whereBetween('purchase_orders.order_date', [$from, $to])
            ->when($userBranchId, fn($q) => $q->where('purchase_orders.branch_id', $userBranchId))
            ->orderByDesc('order_date')
            ->chunk(100, function($rows) use ($out) {
                foreach ($rows as $row) {
                    $itemCount = DB::table('purchase_order_details')->where('po_id', $row->po_id)->count();
                    fputcsv($out, [
                        $row->po_id,
                        $row->supplier_id,
                        $row->name,
                        $row->order_date,
                        $itemCount,
                        number_format($row->total_amount, 2),
                        ucfirst($row->status)
                    ]);
                }
            });
    }

    private function exportMovements($out, $from, $to, $userBranchId)
    {
        fputcsv($out, ['Date', 'Type', 'Product', 'Quantity', 'Branch', 'Moved By']);

        DB::table('stock_movements')
            ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
            ->join('products', 'inventory.product_id', '=', 'products.product_id')
            ->join('branches', 'inventory.branch_id', '=', 'branches.branch_id')
            ->join('users', 'stock_movements.moved_by', '=', 'users.user_id')
            ->select(
                'stock_movements.movement_date as movement_time',
                'stock_movements.reference_type as movement_type',
                'products.name',
                'stock_movements.quantity',
                'branches.name as branch',
                'users.name as user_name'
            )
            ->whereBetween('stock_movements.movement_date', [$from, $to])
            ->when($userBranchId, fn($q) => $q->where('inventory.branch_id', $userBranchId))
            ->orderByDesc('stock_movements.movement_date')
            ->chunk(100, function($rows) use ($out) {
                foreach ($rows as $row) {
                    fputcsv($out, [
                        $row->movement_time,
                        ucfirst(str_replace('_', ' ', $row->movement_type)),
                        $row->name,
                        $row->quantity,
                        $row->branch,
                        $row->user_name
                    ]);
                }
            });
    }
}
