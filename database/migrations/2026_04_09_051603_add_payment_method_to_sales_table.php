<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPaymentMethodToSalesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sales', function (Blueprint $box) {
            if (!Schema::hasColumn('sales', 'payment_method')) {
                $box->string('payment_method')->nullable()->after('total_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sales', function (Blueprint $box) {
            if (Schema::hasColumn('sales', 'payment_method')) {
                $box->dropColumn('payment_method');
            }
        });
    }
}
