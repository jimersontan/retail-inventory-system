<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ═══════════════════════════════════════════════════
        // 1. ROLES
        // ═══════════════════════════════════════════════════
        DB::table('roles')->insertOrIgnore([
            [
                'role_id'     => 1,
                'role_name'   => 'admin',
                'permissions' => json_encode([
                    'all', 'manage_users', 'manage_branches', 'manage_roles',
                    'manage_employees', 'manage_products', 'manage_categories',
                    'manage_inventory', 'manage_po', 'manage_sales', 'manage_orders',
                    'manage_customers', 'view_reports', 'view_cost_price', 'view_salary',
                ]),
            ],
            [
                'role_id'     => 2,
                'role_name'   => 'manager',
                'permissions' => json_encode([
                    'manage_products', 'manage_inventory', 'manage_po',
                    'manage_sales', 'view_employees', 'view_reports',
                    'view_cost_price',
                ]),
            ],
            [
                'role_id'     => 3,
                'role_name'   => 'cashier',
                'permissions' => json_encode([
                    'create_sales', 'view_products', 'view_inventory',
                ]),
            ],
        ]);

        // ═══════════════════════════════════════════════════
        // 2. BRANCH
        // ═══════════════════════════════════════════════════
        DB::table('branches')->insertOrIgnore([
            'branch_id' => 1,
            'name'      => 'Main Headquarters',
            'type'      => 'main',
            'address'   => '123 Rizal Ave, Manila',
            'contact'   => '02-8123-4567',
            'is_active' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // ═══════════════════════════════════════════════════
        // 3. USERS (4 accounts)
        // ═══════════════════════════════════════════════════
        DB::table('users')->insertOrIgnore([
            [
                'user_id'    => 1,
                'name'       => 'System Administrator',
                'email'      => 'admin@ris.com',
                'password'   => Hash::make('admin123'),
                'user_type'  => 'admin',
                'phone'      => '09171234567',
                'address'    => 'Main Headquarters, Manila',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id'    => 2,
                'name'       => 'Store Manager',
                'email'      => 'manager@ris.com',
                'password'   => Hash::make('manager123'),
                'user_type'  => 'manager',
                'phone'      => '09181234567',
                'address'    => 'Main Headquarters, Manila',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id'    => 3,
                'name'       => 'POS Cashier',
                'email'      => 'cashier@ris.com',
                'password'   => Hash::make('cashier123'),
                'user_type'  => 'cashier',
                'phone'      => '09191234567',
                'address'    => 'Main Headquarters, Manila',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id'    => 4,
                'name'       => 'Juan Dela Cruz',
                'email'      => 'customer@ris.com',
                'password'   => Hash::make('customer123'),
                'user_type'  => 'customer',
                'phone'      => '09201234567',
                'address'    => 'Manila, Philippines',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        // ═══════════════════════════════════════════════════
        // 4. EMPLOYEES (users 1,2,3 → branch 1)
        // ═══════════════════════════════════════════════════
        DB::table('employees')->insertOrIgnore([
            [
                'employee_id' => 1,
                'user_id'     => 1,
                'branch_id'   => 1,
                'role_id'     => 1,
                'position'    => 'System Administrator',
                'hire_date'   => Carbon::now()->subYears(3)->toDateString(),
                'salary'      => 85000.00,
                'status'      => 'active',
                'created_at'  => Carbon::now(),
                'updated_at'  => Carbon::now(),
            ],
            [
                'employee_id' => 2,
                'user_id'     => 2,
                'branch_id'   => 1,
                'role_id'     => 2,
                'position'    => 'Store Manager',
                'hire_date'   => Carbon::now()->subYears(2)->toDateString(),
                'salary'      => 55000.00,
                'status'      => 'active',
                'created_at'  => Carbon::now(),
                'updated_at'  => Carbon::now(),
            ],
            [
                'employee_id' => 3,
                'user_id'     => 3,
                'branch_id'   => 1,
                'role_id'     => 3,
                'position'    => 'POS Cashier',
                'hire_date'   => Carbon::now()->subMonths(8)->toDateString(),
                'salary'      => 28000.00,
                'status'      => 'active',
                'created_at'  => Carbon::now(),
                'updated_at'  => Carbon::now(),
            ],
        ]);

        // ═══════════════════════════════════════════════════
        // 5. PROFILES
        // ═══════════════════════════════════════════════════
        DB::table('profiles')->insertOrIgnore([
            [
                'profile_id'    => 1,
                'user_id'       => 1,
                'email'         => 'admin@ris.com',
                'phone'         => '09171234567',
                'photo_url'     => null,
                'date_of_birth' => '1985-03-15',
                'gender'        => 'male',
                'bio'           => 'System administrator with full access',
                'created_at'    => Carbon::now(),
                'updated_at'    => Carbon::now(),
            ],
            [
                'profile_id'    => 2,
                'user_id'       => 2,
                'email'         => 'manager@ris.com',
                'phone'         => '09181234567',
                'photo_url'     => null,
                'date_of_birth' => '1990-07-22',
                'gender'        => 'male',
                'bio'           => 'Branch manager overseeing daily operations',
                'created_at'    => Carbon::now(),
                'updated_at'    => Carbon::now(),
            ],
            [
                'profile_id'    => 3,
                'user_id'       => 3,
                'email'         => 'cashier@ris.com',
                'phone'         => '09191234567',
                'photo_url'     => null,
                'date_of_birth' => '1997-11-08',
                'gender'        => 'female',
                'bio'           => 'Cashier handling POS transactions',
                'created_at'    => Carbon::now(),
                'updated_at'    => Carbon::now(),
            ],
        ]);

        // ═══════════════════════════════════════════════════
        // 6. CUSTOMER RECORD (user 4)
        // ═══════════════════════════════════════════════════
        DB::table('customers')->insertOrIgnore([
            'customer_id'  => 1,
            'user_id'      => 4,
            'branch_id'    => 1,
            'status'       => 'active',
            'verified_at'  => Carbon::now(),
            'created_at'   => Carbon::now(),
            'updated_at'   => Carbon::now(),
        ]);

        // ═══════════════════════════════════════════════════
        // 7. CATEGORIES (3 active)
        // ═══════════════════════════════════════════════════
        DB::table('categories')->insertOrIgnore([
            [
                'category_id'        => 1,
                'category_name'      => 'Beverages',
                'description'        => 'Soft drinks, juices, water, and other beverages',
                'parent_category_id' => null,
                'is_active'          => 1,
                'created_at'         => Carbon::now(),
                'updated_at'         => Carbon::now(),
            ],
            [
                'category_id'        => 2,
                'category_name'      => 'Snacks',
                'description'        => 'Chips, crackers, cookies, and other snack items',
                'parent_category_id' => null,
                'is_active'          => 1,
                'created_at'         => Carbon::now(),
                'updated_at'         => Carbon::now(),
            ],
            [
                'category_id'        => 3,
                'category_name'      => 'Dairy',
                'description'        => 'Milk, cheese, yogurt, and other dairy products',
                'parent_category_id' => null,
                'is_active'          => 1,
                'created_at'         => Carbon::now(),
                'updated_at'         => Carbon::now(),
            ],
        ]);

        // ═══════════════════════════════════════════════════
        // 8. PRODUCTS (10 across 3 categories)
        // ═══════════════════════════════════════════════════
        $products = [
            // Beverages (4)
            ['product_id' => 1, 'name' => 'Coca-Cola 1.5L',       'category_id' => 1, 'supplier_id' => 1, 'unique_sku' => 'RIS-BEV-00000001', 'price' => 85.00,  'cost_price' => 62.00,  'unit' => 'bottle', 'status' => 'available', 'flavor_option' => 'Original'],
            ['product_id' => 2, 'name' => 'Nestea Iced Tea 1L',   'category_id' => 1, 'supplier_id' => 1, 'unique_sku' => 'RIS-BEV-00000002', 'price' => 55.00,  'cost_price' => 38.00,  'unit' => 'bottle', 'status' => 'available', 'flavor_option' => 'Lemon'],
            ['product_id' => 3, 'name' => 'Summit Water 500ml',   'category_id' => 1, 'supplier_id' => 1, 'unique_sku' => 'RIS-BEV-00000003', 'price' => 15.00,  'cost_price' => 8.00,   'unit' => 'bottle', 'status' => 'available', 'flavor_option' => null],
            ['product_id' => 4, 'name' => 'Red Bull Energy 250ml','category_id' => 1, 'supplier_id' => 1, 'unique_sku' => 'RIS-BEV-00000004', 'price' => 65.00,  'cost_price' => 48.00,  'unit' => 'can',    'status' => 'available', 'flavor_option' => 'Original'],
            // Snacks (3)
            ['product_id' => 5, 'name' => 'Piattos Cheese 85g',   'category_id' => 2, 'supplier_id' => 1, 'unique_sku' => 'RIS-SNK-00000001', 'price' => 42.00,  'cost_price' => 28.00,  'unit' => 'pack',   'status' => 'available', 'flavor_option' => 'Cheese'],
            ['product_id' => 6, 'name' => 'Nova Chips 78g',       'category_id' => 2, 'supplier_id' => 1, 'unique_sku' => 'RIS-SNK-00000002', 'price' => 38.00,  'cost_price' => 24.00,  'unit' => 'pack',   'status' => 'available', 'flavor_option' => 'Country Cheddar'],
            ['product_id' => 7, 'name' => 'Skyflakes Crackers',   'category_id' => 2, 'supplier_id' => 1, 'unique_sku' => 'RIS-SNK-00000003', 'price' => 52.00,  'cost_price' => 35.00,  'unit' => 'box',    'status' => 'available', 'flavor_option' => null],
            // Dairy (3)
            ['product_id' => 8,  'name' => 'Alaska Fresh Milk 1L','category_id' => 3, 'supplier_id' => 1, 'unique_sku' => 'RIS-DRY-00000001', 'price' => 95.00,  'cost_price' => 72.00,  'unit' => 'carton', 'status' => 'available', 'flavor_option' => null],
            ['product_id' => 9,  'name' => 'Eden Cheese 160g',    'category_id' => 3, 'supplier_id' => 1, 'unique_sku' => 'RIS-DRY-00000002', 'price' => 68.00,  'cost_price' => 50.00,  'unit' => 'pcs',    'status' => 'available', 'flavor_option' => null],
            ['product_id' => 10, 'name' => 'Yakult 5-Pack',       'category_id' => 3, 'supplier_id' => 1, 'unique_sku' => 'RIS-DRY-00000003', 'price' => 48.00,  'cost_price' => 34.00,  'unit' => 'pack',   'status' => 'available', 'flavor_option' => 'Original'],
        ];

        foreach ($products as $p) {
            DB::table('products')->insertOrIgnore(array_merge($p, [
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }

        // ═══════════════════════════════════════════════════
        // 9. INVENTORY (all 10 products in branch 1)
        // ═══════════════════════════════════════════════════
        $quantities = [45, 30, 8, 22, 5, 38, 15, 3, 42, 25]; // some low-stock
        for ($i = 1; $i <= 10; $i++) {
            DB::table('inventory')->insertOrIgnore([
                'inventory_id' => $i,
                'product_id'   => $i,
                'branch_id'    => 1,
                'quantity'     => $quantities[$i - 1],
                'max_stock'    => 100,
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ]);
        }

        // ═══════════════════════════════════════════════════
        // 10. SALES (5 over last 7 days) + SALE_DETAILS
        // ═══════════════════════════════════════════════════
        $saleData = [
            ['sale_id' => 1, 'days_ago' => 0, 'employee_id' => 3, 'items' => [[1, 2, 85.00], [3, 3, 15.00]]],
            ['sale_id' => 2, 'days_ago' => 1, 'employee_id' => 3, 'items' => [[5, 4, 42.00], [6, 2, 38.00]]],
            ['sale_id' => 3, 'days_ago' => 2, 'employee_id' => 3, 'items' => [[8, 1, 95.00], [10, 3, 48.00]]],
            ['sale_id' => 4, 'days_ago' => 3, 'employee_id' => 3, 'items' => [[2, 5, 55.00], [9, 2, 68.00]]],
            ['sale_id' => 5, 'days_ago' => 5, 'employee_id' => 3, 'items' => [[4, 3, 65.00], [7, 2, 52.00]]],
        ];

        $paymentMethods = ['cash', 'gcash', 'card', 'cash', 'gcash'];
        $saleDetailId = 1;

        foreach ($saleData as $idx => $s) {
            $saleDate = Carbon::now()->subDays($s['days_ago']);
            $total = collect($s['items'])->sum(fn($i) => $i[1] * $i[2]);

            $salePayload = [
                'sale_id'     => $s['sale_id'],
                'branch_id'   => 1,
                'user_id'     => 3,
                'employee_id' => $s['employee_id'],
                'sale_date'   => $saleDate,
                'total_amount' => $total,
                'created_at'  => $saleDate,
                'updated_at'  => $saleDate,
            ];

            // Add payment_method if column exists
            if (Schema::hasColumn('sales', 'payment_method')) {
                $salePayload['payment_method'] = $paymentMethods[$idx];
            }
            // sale_amount alias - the model uses sale_amount but migration uses total_amount
            if (Schema::hasColumn('sales', 'sale_amount')) {
                $salePayload['sale_amount'] = $total;
            }

            DB::table('sales')->insertOrIgnore($salePayload);

            foreach ($s['items'] as $item) {
                DB::table('sale_details')->insertOrIgnore([
                    'sale_detail_id' => $saleDetailId++,
                    'sale_id'        => $s['sale_id'],
                    'product_id'     => $item[0],
                    'quantity'       => $item[1],
                    'unit_price'     => $item[2],
                    'created_at'     => $saleDate,
                    'updated_at'     => $saleDate,
                ]);
            }
        }

        // ═══════════════════════════════════════════════════
        // 11. PURCHASE ORDERS (3) + DETAILS
        // ═══════════════════════════════════════════════════
        $poData = [
            ['po_id' => 1, 'status' => 'pending',   'days_ago' => 1, 'items' => [[1, 50, 62.00], [3, 100, 8.00]]],
            ['po_id' => 2, 'status' => 'approved',   'days_ago' => 3, 'items' => [[5, 40, 28.00], [6, 40, 24.00]]],
            ['po_id' => 3, 'status' => 'received', 'days_ago' => 7, 'items' => [[8, 30, 72.00], [9, 25, 50.00]]],
        ];

        $poDetailId = 1;
        foreach ($poData as $po) {
            $poDate = Carbon::now()->subDays($po['days_ago']);
            $total = collect($po['items'])->sum(fn($i) => $i[1] * $i[2]);

            DB::table('purchase_orders')->insertOrIgnore([
                'po_id'         => $po['po_id'],
                'branch_id'     => 1,
                'supplier_id'   => 1,
                'order_date'    => $poDate->toDateString(),
                'expected_date' => $poDate->copy()->addDays(7)->toDateString(),
                'status'        => $po['status'],
                'total_amount'  => $total,
                'ordered_by'    => 2,
                'created_at'    => $poDate,
                'updated_at'    => $poDate,
            ]);

            foreach ($po['items'] as $item) {
                DB::table('purchase_order_details')->insertOrIgnore([
                    'po_detail_id'     => $poDetailId++,
                    'po_id'            => $po['po_id'],
                    'product_id'       => $item[0],
                    'quantity_ordered'  => $item[1],
                    'quantity_received' => $po['status'] === 'received' ? $item[1] : 0,
                    'unit_price'       => $item[2],
                    'created_at'       => $poDate,
                    'updated_at'       => $poDate,
                ]);
            }
        }

        // ═══════════════════════════════════════════════════
        // 12. ORDERS (4) + ORDER_ITEMS + PAYMENTS
        // ═══════════════════════════════════════════════════
        $orderData = [
            ['order_id' => 1, 'status' => 'pending',    'days_ago' => 0, 'items' => [[1, 2, 85.00], [5, 3, 42.00]]],
            ['order_id' => 2, 'status' => 'pending',    'days_ago' => 1, 'items' => [[8, 1, 95.00]]],
            ['order_id' => 3, 'status' => 'delivered',  'days_ago' => 5, 'items' => [[2, 4, 55.00], [10, 2, 48.00]]],
            ['order_id' => 4, 'status' => 'cancelled',  'days_ago' => 3, 'items' => [[4, 1, 65.00]]],
        ];

        $orderItemId = 1;
        $paymentId = 1;
        foreach ($orderData as $o) {
            $orderDate = Carbon::now()->subDays($o['days_ago']);
            $total = collect($o['items'])->sum(fn($i) => $i[1] * $i[2]);

            DB::table('orders')->insertOrIgnore([
                'order_id'     => $o['order_id'],
                'user_id'      => 4,
                'branch_id'    => 1,
                'total_amount' => $total,
                'status'       => $o['status'],
                'order_date'   => $orderDate,
                'created_at'   => $orderDate,
                'updated_at'   => $orderDate,
            ]);

            foreach ($o['items'] as $item) {
                DB::table('order_items')->insertOrIgnore([
                    'item_id' => $orderItemId++,
                    'order_id'      => $o['order_id'],
                    'product_id'    => $item[0],
                    'quantity'      => $item[1],
                    'unit_price'    => $item[2],
                    'created_at'    => $orderDate,
                    'updated_at'    => $orderDate,
                ]);
            }

            // Payment for each order
            DB::table('payments')->insertOrIgnore([
                'payment_id'     => $paymentId++,
                'order_id'       => $o['order_id'],
                'amount'         => $total,
                'status'         => $o['status'] === 'delivered' ? 'completed' : ($o['status'] === 'cancelled' ? 'refunded' : 'pending'),
                'payment_date'   => $orderDate,
                'created_at'     => $orderDate,
                'updated_at'     => $orderDate,
            ]);
        }

        // ═══════════════════════════════════════════════════
        // 13. REVIEWS (5)
        // ═══════════════════════════════════════════════════
        DB::table('reviews')->insertOrIgnore([
            [
                'review_id'  => 1,
                'user_id'    => 4,
                'product_id' => 1,
                'order_id'   => 3,
                'rating'     => 5,
                'comment'    => 'Great value for the price! Always refreshing.',
                'review_date' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'review_id'  => 2,
                'user_id'    => 4,
                'product_id' => 5,
                'order_id'   => null,
                'rating'     => 4,
                'comment'    => 'Tasty cheese flavor, perfect snack!',
                'review_date' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'review_id'  => 3,
                'user_id'    => 4,
                'product_id' => 8,
                'order_id'   => null,
                'rating'     => 5,
                'comment'    => 'Fresh and creamy milk. Great for coffee.',
                'review_date' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'review_id'  => 4,
                'user_id'    => 4,
                'product_id' => 2,
                'order_id'   => 3,
                'rating'     => 3,
                'comment'    => 'Decent taste but a bit too sweet.',
                'review_date' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'review_id'  => 5,
                'user_id'    => 4,
                'product_id' => 10,
                'order_id'   => 3,
                'rating'     => 4,
                'comment'    => 'Kids love it! Always a family favorite.',
                'review_date' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        // ═══════════════════════════════════════════════════
        // 14. STOCK MOVEMENTS (3)
        // ═══════════════════════════════════════════════════
        DB::table('stock_movements')->insertOrIgnore([
            [
                'movement_id'   => 1,
                'inventory_id'  => 1,
                'quantity'      => 20,
                'movement_type' => 'in',
                'reference_type' => 'purchase_order',
                'reference_id'  => 3,
                'notes'         => 'PO #3 received',
                'moved_by'      => 2,
                'movement_date' => Carbon::now()->subDays(7),
                'created_at'    => Carbon::now()->subDays(7),
                'updated_at'    => Carbon::now()->subDays(7),
            ],
            [
                'movement_id'   => 2,
                'inventory_id'  => 8,
                'quantity'      => 15,
                'movement_type' => 'in',
                'reference_type' => 'purchase_order',
                'reference_id'  => 3,
                'notes'         => 'PO #3 received - dairy products',
                'moved_by'      => 2,
                'movement_date' => Carbon::now()->subDays(7),
                'created_at'    => Carbon::now()->subDays(7),
                'updated_at'    => Carbon::now()->subDays(7),
            ],
            [
                'movement_id'   => 3,
                'inventory_id'  => 5,
                'quantity'      => -3,
                'movement_type' => 'adjustment',
                'reference_type' => 'adjustment',
                'reference_id'  => null,
                'notes'         => 'Damaged items removed from shelf',
                'moved_by'      => 1,
                'movement_date' => Carbon::now()->subDays(2),
                'created_at'    => Carbon::now()->subDays(2),
                'updated_at'    => Carbon::now()->subDays(2),
            ],
        ]);
    }
}
