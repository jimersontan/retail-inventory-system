<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Order;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\Review;
use App\Models\CustomerProduct;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $role = $user->user_type;

        // Parse date range
        $from = $request->from
            ? Carbon::parse($request->from)->startOfDay()
            : Carbon::now()->startOfMonth();
        $to = $request->to
            ? Carbon::parse($request->to)->endOfDay()
            : Carbon::now()->endOfDay();

        // Branch scoping
        $branchId = null;
        $empId = null;

        if (in_array($role, ['manager', 'cashier'])) {
            $user->load('employee');
            $branchId = $user->employee->branch_id ?? null;
            $empId = $user->employee->employee_id ?? null;
        }

        try {
            $data = [
                'role'             => $role,
                'kpis'             => $this->getKPIs($role, $from, $to, $branchId, $empId, $user),
                'sales_trend'      => $this->getSalesTrend($from, $to, $branchId, $empId, $role),
                'category_revenue' => $this->getCategoryRevenue($from, $to, $branchId),
                'top_products'     => $this->getTopProducts($from, $to, $branchId),
                'low_stock_items'  => $this->getLowStockItems($branchId),
                'recent_activity'  => $this->getRecentActivity($branchId),
                'recent_sales'     => $this->getRecentSales($branchId, $empId, $role),
            ];

            // Cashier-specific: payment methods pie chart
            if ($role === 'cashier' && $empId) {
                $data['payment_methods'] = $this->getPaymentMethods($empId, $from, $to);
            }

            // Customer-specific: my orders + reviewable products
            if ($role === 'customer') {
                $data['my_orders']           = $this->getMyOrders($user->user_id);
                $data['reviewable_products'] = $this->getReviewableProducts($user->user_id);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════
    // KPIs — role-specific
    // ═══════════════════════════════════════════════════
    private function getKPIs($role, $from, $to, $branchId, $empId, $user)
    {
        $today = Carbon::today();
        $todayEnd = Carbon::today()->endOfDay();

        // Trend helpers
        $periodDays = $from->diffInDays($to) ?: 1;
        $prevFrom = $from->copy()->subDays($periodDays);
        $prevTo = $from->copy()->subDay()->endOfDay();

        // Determine sale_amount column
        $saleAmountCol = Schema::hasColumn('sales', 'sale_amount') ? 'sale_amount' : 'total_amount';

        if ($role === 'admin') {
            // --- ADMIN KPIs ---
            $todayRevenue = DB::table('sales')
                ->whereBetween('sale_date', [$today, $todayEnd])
                ->sum($saleAmountCol) ?? 0;

            // Trend: compare last 7 days vs previous 7 days
            $last7 = DB::table('sales')
                ->whereBetween('sale_date', [Carbon::now()->subDays(7), Carbon::now()])
                ->sum($saleAmountCol) ?? 0;
            $prev7 = DB::table('sales')
                ->whereBetween('sale_date', [Carbon::now()->subDays(14), Carbon::now()->subDays(7)])
                ->sum($saleAmountCol) ?? 0;
            $revenueTrend = $prev7 > 0 ? round((($last7 - $prev7) / $prev7) * 100, 1) : 0;

            $totalSales = DB::table('sales')->whereBetween('sale_date', [$from, $to])->count();
            $prevSales = DB::table('sales')->whereBetween('sale_date', [$prevFrom, $prevTo])->count();
            $salesTrend = $prevSales > 0 ? round((($totalSales - $prevSales) / $prevSales) * 100, 1) : 0;

            $lowStock = DB::table('inventory')->where('quantity', '<=', 10)->count();
            $pendingOrders = DB::table('orders')->where('status', 'pending')->count();

            return [
                'today_revenue'       => round((float) $todayRevenue, 2),
                'today_revenue_trend' => $revenueTrend,
                'total_sales'         => $totalSales,
                'sales_trend'         => $salesTrend,
                'low_stock'           => $lowStock,
                'pending_orders'      => $pendingOrders,
            ];
        }

        if ($role === 'manager') {
            // --- MANAGER KPIs (branch-scoped) ---
            $branchRevenue = DB::table('sales')
                ->where('branch_id', $branchId)
                ->whereBetween('sale_date', [$from, $to])
                ->sum($saleAmountCol) ?? 0;

            $branchSales = DB::table('sales')
                ->where('branch_id', $branchId)
                ->whereBetween('sale_date', [$from, $to])
                ->count();

            $lowStock = DB::table('inventory')
                ->where('branch_id', $branchId)
                ->where('quantity', '<=', 10)
                ->count();

            $pendingPOs = DB::table('purchase_orders')
                ->where('branch_id', $branchId)
                ->whereIn('status', ['pending', 'approved'])
                ->count();

            return [
                'branch_revenue' => round((float) $branchRevenue, 2),
                'branch_sales'   => $branchSales,
                'low_stock'      => $lowStock,
                'pending_pos'    => $pendingPOs,
            ];
        }

        if ($role === 'cashier') {
            // --- CASHIER KPIs (own sales) ---
            $mySalesToday = DB::table('sales')
                ->where('employee_id', $empId)
                ->whereBetween('sale_date', [$today, $todayEnd])
                ->count();

            $myRevenueToday = DB::table('sales')
                ->where('employee_id', $empId)
                ->whereBetween('sale_date', [$today, $todayEnd])
                ->sum($saleAmountCol) ?? 0;

            $avgSaleValue = DB::table('sales')
                ->where('employee_id', $empId)
                ->whereBetween('sale_date', [$from, $to])
                ->avg($saleAmountCol) ?? 0;

            $productsAvailable = DB::table('products')
                ->where('status', 'available')
                ->count();

            return [
                'my_sales_today'     => $mySalesToday,
                'my_revenue_today'   => round((float) $myRevenueToday, 2),
                'avg_sale_value'     => round((float) $avgSaleValue, 2),
                'products_available' => $productsAvailable,
            ];
        }

        if ($role === 'customer') {
            // --- CUSTOMER KPIs ---
            $myOrders = DB::table('orders')
                ->where('user_id', $user->user_id)
                ->count();

            $totalSpent = DB::table('orders')
                ->where('user_id', $user->user_id)
                ->where('status', 'delivered')
                ->sum('total_amount') ?? 0;

            $myReviews = DB::table('reviews')
                ->where('user_id', $user->user_id)
                ->count();

            $customerId = DB::table('customers')
                ->where('user_id', $user->user_id)
                ->value('customer_id');

            $myListings = $customerId
                ? DB::table('customer_products')
                    ->where('seller_id', $customerId)
                    ->count()
                : 0;

            return [
                'my_orders'   => $myOrders,
                'total_spent' => round((float) $totalSpent, 2),
                'my_reviews'  => $myReviews,
                'my_listings' => $myListings,
            ];
        }

        return [];
    }

    // ═══════════════════════════════════════════════════
    // Sales Trend
    // ═══════════════════════════════════════════════════
    private function getSalesTrend($from, $to, $branchId, $empId, $role)
    {
        $saleAmountCol = Schema::hasColumn('sales', 'sale_amount') ? 'sale_amount' : 'total_amount';

        return DB::table('sales')
            ->selectRaw("DATE(sale_date) as date, SUM({$saleAmountCol}) as revenue, COUNT(*) as count")
            ->whereBetween('sale_date', [$from, $to])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($role === 'cashier' && $empId, fn($q) => $q->where('employee_id', $empId))
            ->groupBy(DB::raw('DATE(sale_date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date'    => Carbon::parse($item->date)->format('M d'),
                'revenue' => (float) $item->revenue,
                'count'   => (int) $item->count,
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Category Revenue
    // ═══════════════════════════════════════════════════
    private function getCategoryRevenue($from, $to, $branchId)
    {
        $colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

        return DB::table('sale_details')
            ->join('products', 'sale_details.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->join('sales', 'sale_details.sale_id', '=', 'sales.sale_id')
            ->selectRaw('categories.category_name, SUM(sale_details.quantity * sale_details.unit_price) as revenue')
            ->whereBetween('sales.sale_date', [$from, $to])
            ->when($branchId, fn($q) => $q->where('sales.branch_id', $branchId))
            ->groupBy('categories.category_id', 'categories.category_name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn($item, $idx) => [
                'category' => $item->category_name,
                'revenue'  => (float) $item->revenue,
                'color'    => $colors[$idx % count($colors)],
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Top Products
    // ═══════════════════════════════════════════════════
    private function getTopProducts($from, $to, $branchId)
    {
        return DB::table('sale_details')
            ->join('products', 'sale_details.product_id', '=', 'products.product_id')
            ->join('sales', 'sale_details.sale_id', '=', 'sales.sale_id')
            ->selectRaw('products.product_id, products.name, products.unique_sku,
                         SUM(sale_details.quantity) as total_qty,
                         SUM(sale_details.quantity * sale_details.unit_price) as revenue')
            ->whereBetween('sales.sale_date', [$from, $to])
            ->when($branchId, fn($q) => $q->where('sales.branch_id', $branchId))
            ->groupBy('products.product_id', 'products.name', 'products.unique_sku')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn($item, $idx) => [
                'rank'       => $idx + 1,
                'product_id' => $item->product_id,
                'name'       => $item->name,
                'sku'        => $item->unique_sku,
                'quantity'   => (int) $item->total_qty,
                'revenue'    => (float) $item->revenue,
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Low Stock Items
    // ═══════════════════════════════════════════════════
    private function getLowStockItems($branchId)
    {
        return DB::table('inventory')
            ->join('products', 'inventory.product_id', '=', 'products.product_id')
            ->join('branches', 'inventory.branch_id', '=', 'branches.branch_id')
            ->select(
                'inventory.inventory_id', 'products.product_id', 'products.name',
                'branches.name as branch', 'inventory.quantity', 'inventory.max_stock',
                'products.unique_sku'
            )
            ->where('inventory.quantity', '<=', 10)
            ->when($branchId, fn($q) => $q->where('inventory.branch_id', $branchId))
            ->orderBy('inventory.quantity')
            ->limit(8)
            ->get()
            ->map(fn($item) => [
                'inventory_id' => $item->inventory_id,
                'product_id'   => $item->product_id,
                'name'         => $item->name,
                'sku'          => $item->unique_sku,
                'branch'       => $item->branch,
                'quantity'     => (int) $item->quantity,
                'max_stock'    => (int) $item->max_stock,
                'status'       => $item->quantity == 0 ? 'out_of_stock' : ($item->quantity <= 5 ? 'critical' : 'low'),
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Recent Activity
    // ═══════════════════════════════════════════════════
    private function getRecentActivity($branchId)
    {
        return DB::table('stock_movements')
            ->join('inventory', 'stock_movements.inventory_id', '=', 'inventory.inventory_id')
            ->join('products', 'inventory.product_id', '=', 'products.product_id')
            ->join('branches', 'inventory.branch_id', '=', 'branches.branch_id')
            ->leftJoin('employees', 'stock_movements.moved_by', '=', 'employees.employee_id')
            ->leftJoin('users', 'employees.user_id', '=', 'users.user_id')
            ->select(
                'stock_movements.movement_id', 'stock_movements.movement_type',
                'stock_movements.quantity', 'stock_movements.movement_date',
                'products.name as product_name', 'users.name as user_name',
                'branches.name as branch_name'
            )
            ->when($branchId, fn($q) => $q->where('inventory.branch_id', $branchId))
            ->orderBy('stock_movements.movement_date', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'movement_id' => $item->movement_id,
                'type'        => $item->movement_type,
                'description' => ucfirst($item->movement_type) . ": {$item->quantity} units of {$item->product_name} at {$item->branch_name}",
                'user'        => $item->user_name ?? 'System',
                'time_ago'    => Carbon::parse($item->movement_date)->diffForHumans(),
                'timestamp'   => $item->movement_date,
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Recent Sales
    // ═══════════════════════════════════════════════════
    private function getRecentSales($branchId, $empId, $role)
    {
        $saleAmountCol = Schema::hasColumn('sales', 'sale_amount') ? 'sale_amount' : 'total_amount';

        $query = DB::table('sales')
            ->join('employees', 'sales.employee_id', '=', 'employees.employee_id')
            ->join('users', 'employees.user_id', '=', 'users.user_id')
            ->join('branches', 'sales.branch_id', '=', 'branches.branch_id')
            ->select(
                'sales.sale_id', 'sales.sale_date',
                DB::raw("sales.{$saleAmountCol} as amount"),
                'users.name as cashier', 'branches.name as branch'
            );

        if (Schema::hasColumn('sales', 'payment_method')) {
            $query->addSelect('sales.payment_method');
        }

        return $query
            ->when($branchId, fn($q) => $q->where('sales.branch_id', $branchId))
            ->when($role === 'cashier' && $empId, fn($q) => $q->where('sales.employee_id', $empId))
            ->orderByDesc('sales.sale_date')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'sale_id'        => $item->sale_id,
                'date'           => Carbon::parse($item->sale_date)->format('M d, Y h:i A'),
                'amount'         => (float) $item->amount,
                'cashier'        => $item->cashier,
                'branch'         => $item->branch,
                'payment_method' => $item->payment_method ?? 'cash',
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Payment Methods (Cashier)
    // ═══════════════════════════════════════════════════
    private function getPaymentMethods($empId, $from, $to)
    {
        if (!Schema::hasColumn('sales', 'payment_method')) {
            return [
                ['method' => 'cash', 'count' => 0],
            ];
        }

        return DB::table('sales')
            ->selectRaw('payment_method as method, COUNT(*) as count')
            ->where('employee_id', $empId)
            ->whereBetween('sale_date', [$from, $to])
            ->groupBy('payment_method')
            ->get();
    }

    // ═══════════════════════════════════════════════════
    // My Orders (Customer)
    // ═══════════════════════════════════════════════════
    private function getMyOrders($userId)
    {
        return DB::table('orders')
            ->leftJoin('branches', 'orders.branch_id', '=', 'branches.branch_id')
            ->select('orders.*', 'branches.name as branch_name')
            ->where('orders.user_id', $userId)
            ->orderByDesc('orders.order_date')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'order_id'     => $item->order_id,
                'total_amount' => (float) $item->total_amount,
                'status'       => $item->status,
                'order_date'   => Carbon::parse($item->order_date)->format('M d, Y'),
                'branch'       => $item->branch_name,
            ]);
    }

    // ═══════════════════════════════════════════════════
    // Reviewable Products (Customer)
    // ═══════════════════════════════════════════════════
    private function getReviewableProducts($userId)
    {
        // Products purchased but not yet reviewed
        $purchasedProductIds = DB::table('orders')
            ->join('order_items', 'orders.order_id', '=', 'order_items.order_id')
            ->where('orders.user_id', $userId)
            ->where('orders.status', 'delivered')
            ->pluck('order_items.product_id')
            ->unique();

        $reviewedProductIds = DB::table('reviews')
            ->where('user_id', $userId)
            ->pluck('product_id');

        $notReviewed = $purchasedProductIds->diff($reviewedProductIds);

        $products = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select('products.product_id', 'products.name', 'categories.category_name')
            ->whereIn('products.product_id', $notReviewed->values())
            ->limit(4)
            ->get()
            ->map(fn($p) => [
                'product_id'    => $p->product_id,
                'name'          => $p->name,
                'category'      => $p->category_name,
                'reviewed'      => false,
                'review'        => null,
            ]);

        // Append already reviewed products
        $reviewed = DB::table('reviews')
            ->join('products', 'reviews.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select('products.product_id', 'products.name', 'categories.category_name',
                     'reviews.review_id', 'reviews.rating', 'reviews.comment')
            ->where('reviews.user_id', $userId)
            ->limit(4)
            ->get()
            ->map(fn($p) => [
                'product_id'    => $p->product_id,
                'name'          => $p->name,
                'category'      => $p->category_name,
                'reviewed'      => true,
                'review'        => [
                    'review_id' => $p->review_id,
                    'rating'    => $p->rating,
                    'comment'   => $p->comment,
                ],
            ]);

        return $products->merge($reviewed)->take(8)->values();
    }
}
