<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixProductColumnNames extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Use raw SQL to avoid doctrine/dbal dependency for renames
            DB::statement("ALTER TABLE products CHANGE sku unique_sku VARCHAR(255) NOT NULL");
            DB::statement("ALTER TABLE products CHANGE description flavor_option TEXT NULL");
            
            // Update status enum
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('available', 'unavailable', 'discontinued') DEFAULT 'available'");
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            DB::statement("ALTER TABLE products CHANGE unique_sku sku VARCHAR(255) NOT NULL");
            DB::statement("ALTER TABLE products CHANGE flavor_option description TEXT NULL");
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active'");
        });
    }
}
