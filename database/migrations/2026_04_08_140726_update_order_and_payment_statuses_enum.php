<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateOrderAndPaymentStatusesEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Update orders status ENUM
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled', 'shipped', 'delivered') NOT NULL DEFAULT 'pending'");
        
        // Update payments status ENUM
        // Adding 'paid' as an alias for 'completed' to match UI terminology
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'completed', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Fallback to original ENUMs (Note: this might fail if new statuses are already in use)
        // To be safe, we'll keep the new statuses but just revert the default if necessary
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending'");
    }
}
