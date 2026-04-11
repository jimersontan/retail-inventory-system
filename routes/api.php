<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\StockAdjustmentController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerProductController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Models\Customer;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'indexByProduct']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard — ALL authenticated roles can access
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // All authenticated users can view categories and products
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    // Review (Read)
    Route::get('/reviews', [ReviewController::class, 'index']);

    // Order Discovery (Shared)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Roles (read-only for admin)
    Route::get('/roles', function () {
        return response()->json([
            'data' => \App\Models\Role::all()
        ]);
    });

    // ─── Admin + Manager Shared ───────────────────────
    Route::middleware('role:admin,manager')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::get('/employees/{id}', [EmployeeController::class, 'show']);

        Route::get('/suppliers', function () {
            $suppliers = Customer::with('user')->get();
            return response()->json(['data' => $suppliers], 200);
        });

        // Purchase Orders
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update']);
        // Purchase Order Status Update
        Route::patch('/purchase-orders/{id}/status', [PurchaseOrderController::class, 'updateStatus']);
        Route::post('/purchase-orders/{id}/receive', [PurchaseOrderController::class, 'receive']);
        Route::patch('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel']);

        // Categories (write)
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::patch('/categories/{id}/toggle', [CategoryController::class, 'toggleActive']);

        // Products (write)
        Route::post('/products', [ProductController::class, 'store']);
        // Product Update
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::patch('/products/{id}/status', [ProductController::class, 'updateStatus']);

        // Review Management
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

        // Inventory adjust + stock movements
        Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);
        Route::get('/stock-movements', [StockMovementController::class, 'index']);

        // Stock Adjustments
        Route::get('/adjustments', [StockAdjustmentController::class, 'index']);
        Route::post('/adjustments', [StockAdjustmentController::class, 'store']);

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'sales']);
        Route::get('/reports/inventory', [ReportController::class, 'inventory']);
        Route::get('/reports/purchases', [ReportController::class, 'purchases']);
        Route::get('/reports/movements', [ReportController::class, 'movements']);
        Route::get('/reports/export', [ReportController::class, 'export']);

        // Customer Management
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
    });

    // ─── Universal Scopes (Admin, Manager, Cashier) ───
    Route::middleware('role:admin,manager,cashier')->group(function () {
        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{id}', [BranchController::class, 'show']);
        Route::get('/inventory', [InventoryController::class, 'index']);
        Route::get('/inventory/{id}', [InventoryController::class, 'show']);
        Route::get('/sales', [SaleController::class, 'index']);
        Route::get('/sales/{id}', [SaleController::class, 'show']);

        // Order Management
        Route::get('/orders/manage', [OrderController::class, 'index']);
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

        // POS Storage
        Route::post('/sales', [SaleController::class, 'store']);
    });

    // ─── Admin Only ───────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        // User Management (full CRUD)
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Product Deletion
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Employee Management (write)
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::put('/employees/{id}', [EmployeeController::class, 'update']);
        Route::patch('/employees/{id}/toggle', [EmployeeController::class, 'toggleStatus']);

        // Branch Management
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);
        Route::patch('/branches/{id}/toggle', [BranchController::class, 'toggleActive']);

        // Customer Verification
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::put('/customers/{id}', [CustomerController::class, 'update']);
        Route::patch('/customers/{id}/verify', [CustomerController::class, 'verify']);
        Route::patch('/customers/{id}/toggle-status', [CustomerController::class, 'toggleStatus']);
    });

    // ─── Customer Routes ──────────────────────────────
    Route::middleware('role:customer')->group(function () {
        // Customer Profile Update
        Route::put('/customers/profile/update', [CustomerController::class, 'update']);

        // Reseller Listings
        Route::get('/listings', [CustomerProductController::class, 'index']);
        Route::post('/listings', [CustomerProductController::class, 'store']);
        Route::put('/listings/{id}', [CustomerProductController::class, 'update']);
        Route::patch('/listings/{id}/toggle', [CustomerProductController::class, 'toggleAvailable']);
        Route::delete('/listings/{id}', [CustomerProductController::class, 'destroy']);

        // Customer Reviews
        Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
        Route::get('/reviews/{id}', [ReviewController::class, 'show']);
        Route::put('/reviews/{id}', [ReviewController::class, 'update']);

        // Customer Orders
        Route::post('/orders', [OrderController::class, 'store']);
        Route::patch('/orders/{id}/cancel', [OrderController::class, 'cancel']);
        Route::post('/orders/{id}/confirm-payment', [OrderController::class, 'confirmPayment']);
    });
});
