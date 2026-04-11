<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePurchaseOrdersTable extends Migration
{
    public function up()
    {
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
    }

    public function down()
    {
        Schema::dropIfExists('purchase_orders');
    }
}
