<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerProductsTable extends Migration
{
    public function up()
    {
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
    }

    public function down()
    {
        Schema::dropIfExists('customer_products');
    }
}
