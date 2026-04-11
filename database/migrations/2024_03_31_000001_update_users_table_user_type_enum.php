<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class UpdateUsersTableUserTypeEnum extends Migration
{
    public function up()
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('admin', 'manager', 'cashier', 'employee', 'customer', 'supplier') DEFAULT 'customer'");
        }
    }

    public function down()
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('admin', 'employee', 'customer', 'supplier') DEFAULT 'customer'");
        }
    }
}
