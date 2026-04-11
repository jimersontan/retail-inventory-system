<?php
$dir = __DIR__ . '/database/migrations/';

function make_migration($filename, $classname, $up, $down) {
    global $dir;
    $content = "<?php\n\nuse Illuminate\Database\Migrations\Migration;\nuse Illuminate\Database\Schema\Blueprint;\nuse Illuminate\Support\Facades\Schema;\n\nclass $classname extends Migration\n{\n    public function up()\n    {\n$up\n    }\n\n    public function down()\n    {\n$down\n    }\n}\n";
    file_put_contents($dir . $filename, $content);
}

// 01 Roles
make_migration('2024_03_30_000001_create_roles_table.php', 'CreateRolesTable', <<<'UP'
        Schema::create('roles', function (Blueprint $table) {
            $table->id('role_id');
            $table->string('role_name');
            $table->text('permissions')->nullable();
            $table->timestamps();
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('roles');
DOWN
);

// 02 Users
make_migration('2024_03_30_000002_create_users_table.php', 'CreateUsersTable', <<<'UP'
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->enum('user_type', ['admin', 'employee', 'customer', 'supplier'])->default('customer');
            $table->timestamps();
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('users');
DOWN
);

// 03 Branches
make_migration('2024_03_30_000003_create_branches_table.php', 'CreateBranchesTable', <<<'UP'
        Schema::create('branches', function (Blueprint $table) {
            $table->id('branch_id');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('contact')->nullable();
            $table->enum('type', ['main', 'sub', 'warehouse'])->default('sub');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('branches');
DOWN
);

// 04 Categories
make_migration('2024_03_30_000004_create_categories_table.php', 'CreateCategoriesTable', <<<'UP'
        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('category_name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_category_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('parent_category_id')->references('category_id')->on('categories')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('categories');
DOWN
);

// 05 Profiles
make_migration('2024_03_30_000005_create_profiles_table.php', 'CreateProfilesTable', <<<'UP'
        Schema::create('profiles', function (Blueprint $table) {
            $table->id('profile_id');
            $table->unsignedBigInteger('user_id');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('photo_url')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('profiles');
DOWN
);

// 06 Employees
make_migration('2024_03_30_000006_create_employees_table.php', 'CreateEmployeesTable', <<<'UP'
        Schema::create('employees', function (Blueprint $table) {
            $table->id('employee_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('role_id');
            $table->string('position')->nullable();
            $table->date('hire_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('role_id')->references('role_id')->on('roles')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('employees');
DOWN
);

// 07 Customers
make_migration('2024_03_30_000007_create_customers_table.php', 'CreateCustomersTable', <<<'UP'
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customer_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->string('store_name')->nullable();
            $table->enum('status', ['pending', 'active', 'suspended', 'inactive'])->default('pending');
            $table->dateTime('verified_at')->nullable();
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('set null');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('customers');
DOWN
);

// 08 Products
make_migration('2024_03_30_000008_create_products_table.php', 'CreateProductsTable', <<<'UP'
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku')->unique();
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('supplier_id'); // refers to users.user_id
            $table->string('unit')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->enum('status', ['active', 'inactive', 'out_of_stock'])->default('active');
            $table->timestamps();
            $table->foreign('category_id')->references('category_id')->on('categories')->onDelete('cascade');
            $table->foreign('supplier_id')->references('user_id')->on('users')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('products');
DOWN
);

// 09 Customer Products
make_migration('2024_03_30_000009_create_customer_products_table.php', 'CreateCustomerProductsTable', <<<'UP'
        Schema::create('customer_products', function (Blueprint $table) {
            $table->unsignedBigInteger('seller_id'); // refers to customers.customer_id
            $table->unsignedBigInteger('product_id');
            $table->decimal('custom_price', 10, 2);
            $table->integer('stock_qty')->default(0);
            $table->boolean('is_available')->default(1);
            $table->timestamp('listed_at')->useCurrent();
            $table->timestamps();
            
            $table->primary(['seller_id', 'product_id']);
            $table->foreign('seller_id')->references('customer_id')->on('customers')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('customer_products');
DOWN
);

// 10 Inventory
make_migration('2024_03_30_000010_create_inventory_table.php', 'CreateInventoryTable', <<<'UP'
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('quantity');
            $table->integer('min_stock')->default(0);
            $table->integer('max_stock')->nullable();
            $table->dateTime('last_updated')->nullable();
            $table->timestamps();
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('inventory');
DOWN
);

// 11 Purchase Orders
make_migration('2024_03_30_000011_create_purchase_orders_table.php', 'CreatePurchaseOrdersTable', <<<'UP'
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id('po_id');
            $table->unsignedBigInteger('supplier_id'); // refers to users.user_id
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('ordered_by'); // refers to employees.employee_id
            $table->date('order_date');
            $table->date('expected_date')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['pending', 'approved', 'received', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->foreign('supplier_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('ordered_by')->references('employee_id')->on('employees')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('purchase_orders');
DOWN
);

// 12 Sales
make_migration('2024_03_30_000012_create_sales_table.php', 'CreateSalesTable', <<<'UP'
        Schema::create('sales', function (Blueprint $table) {
            $table->id('sale_id');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('user_id')->nullable(); // user or customer
            $table->unsignedBigInteger('employee_id');
            $table->dateTime('sale_date');
            $table->decimal('total_amount', 12, 2);
            $table->timestamps();
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('sales');
DOWN
);

// 13 Orders
make_migration('2024_03_30_000013_create_orders_table.php', 'CreateOrdersTable', <<<'UP'
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->dateTime('order_date');
            $table->timestamps();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('set null');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('orders');
DOWN
);

// 14 Reviews
make_migration('2024_03_30_000014_create_reviews_table.php', 'CreateReviewsTable', <<<'UP'
        Schema::create('reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->tinyInteger('rating')->unsigned(); // CHECK (rating BETWEEN 1 AND 5) implied
            $table->text('comment')->nullable();
            $table->dateTime('review_date');
            $table->timestamps();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('set null');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('reviews');
DOWN
);

// 15 Stock Movements
make_migration('2024_03_30_000015_create_stock_movements_table.php', 'CreateStockMovementsTable', <<<'UP'
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id('movement_id');
            $table->unsignedBigInteger('inventory_id');
            $table->enum('movement_type', ['in', 'out', 'transfer', 'adjustment']);
            $table->integer('quantity');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->unsignedBigInteger('moved_by')->nullable(); // refers to employees.employee_id
            $table->dateTime('movement_date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('inventory_id')->references('inventory_id')->on('inventory')->onDelete('cascade');
            $table->foreign('moved_by')->references('employee_id')->on('employees')->onDelete('set null');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('stock_movements');
DOWN
);

// 16 Purchase Order Details
make_migration('2024_03_30_000016_create_purchase_order_details_table.php', 'CreatePurchaseOrderDetailsTable', <<<'UP'
        Schema::create('purchase_order_details', function (Blueprint $table) {
            $table->id('po_detail_id');
            $table->unsignedBigInteger('po_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('quantity_ordered');
            $table->integer('quantity_received')->default(0);
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
            $table->foreign('po_id')->references('po_id')->on('purchase_orders')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('purchase_order_details');
DOWN
);

// 17 Sale Details
make_migration('2024_03_30_000017_create_sale_details_table.php', 'CreateSaleDetailsTable', <<<'UP'
        Schema::create('sale_details', function (Blueprint $table) {
            $table->id('sale_detail_id');
            $table->unsignedBigInteger('sale_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
            $table->foreign('sale_id')->references('sale_id')->on('sales')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('sale_details');
DOWN
);

// 18 Order Items
make_migration('2024_03_30_000018_create_order_items_table.php', 'CreateOrderItemsTable', <<<'UP'
        Schema::create('order_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('order_items');
DOWN
);

// 19 Payments
make_migration('2024_03_30_000019_create_payments_table.php', 'CreatePaymentsTable', <<<'UP'
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('order_id');
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->dateTime('payment_date');
            $table->timestamps();
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade');
        });
UP
, <<<'DOWN'
        Schema::dropIfExists('payments');
DOWN
);

echo "Migrations generated successfully.\n";
