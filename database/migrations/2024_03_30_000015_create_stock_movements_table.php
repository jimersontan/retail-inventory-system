<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockMovementsTable extends Migration
{
    public function up()
    {
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
    }

    public function down()
    {
        Schema::dropIfExists('stock_movements');
    }
}
