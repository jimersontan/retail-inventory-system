<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $primaryKey = 'inventory_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'branch_id',
        'product_id',
        'quantity',
        'init_stock',
        'max_stock',
        'last_updated',
    ];

    protected $casts = [
        'last_updated' => 'datetime',
        'quantity' => 'integer',
        'init_stock' => 'integer',
        'max_stock' => 'integer',
    ];

    protected $appends = ['stock_level', 'stock_percentage'];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class, 'inventory_id', 'inventory_id');
    }

    public function getStockLevelAttribute()
    {
        if ($this->quantity <= 0) return 'out_of_stock';
        if ($this->quantity <= 10) return 'low_stock';
        return 'in_stock';
    }

    public function getStockPercentageAttribute()
    {
        if ($this->max_stock <= 0) return 0;
        
        $pct = round(($this->quantity / $this->max_stock) * 100);
        return $pct > 100 ? 100 : $pct;
    }
}
