<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateProfilesTableStructure extends Migration
{
    public function up()
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            // Add missing columns to profiles table using raw SQL to avoid issues
            DB::statement("
                ALTER TABLE profiles
                ADD COLUMN IF NOT EXISTS employee_id BIGINT UNSIGNED NULL AFTER profile_id,
                ADD COLUMN IF NOT EXISTS supplier_id BIGINT UNSIGNED NULL AFTER employee_id,
                ADD COLUMN IF NOT EXISTS phone_no VARCHAR(255) NULL AFTER supplier_id,
                ADD COLUMN IF NOT EXISTS branch_id BIGINT UNSIGNED NULL AFTER email,
                ADD COLUMN IF NOT EXISTS zip VARCHAR(255) NULL AFTER gender,
                ADD COLUMN IF NOT EXISTS key_field VARCHAR(255) NULL AFTER zip
            ");

            // Add foreign key constraints
            try {
                DB::statement("ALTER TABLE profiles ADD CONSTRAINT fk_profiles_employee_id FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE");
            } catch (\Exception $e) {
                // Foreign key might already exist
            }

            try {
                DB::statement("ALTER TABLE profiles ADD CONSTRAINT fk_profiles_supplier_id FOREIGN KEY (supplier_id) REFERENCES customers(customer_id) ON DELETE CASCADE");
            } catch (\Exception $e) {
                // Foreign key might already exist
            }

            try {
                DB::statement("ALTER TABLE profiles ADD CONSTRAINT fk_profiles_branch_id FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL");
            } catch (\Exception $e) {
                // Foreign key might already exist
            }
        }
    }

    public function down()
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            // Drop foreign key constraints
            DB::statement("ALTER TABLE profiles DROP FOREIGN KEY IF EXISTS fk_profiles_employee_id");
            DB::statement("ALTER TABLE profiles DROP FOREIGN KEY IF EXISTS fk_profiles_supplier_id");
            DB::statement("ALTER TABLE profiles DROP FOREIGN KEY IF EXISTS fk_profiles_branch_id");

            // Drop columns
            DB::statement("
                ALTER TABLE profiles
                DROP COLUMN IF EXISTS key_field,
                DROP COLUMN IF EXISTS zip,
                DROP COLUMN IF EXISTS branch_id,
                DROP COLUMN IF EXISTS phone_no,
                DROP COLUMN IF EXISTS supplier_id,
                DROP COLUMN IF EXISTS employee_id
            ");
        }
    }
}
