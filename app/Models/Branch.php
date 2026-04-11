<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $primaryKey = 'branch_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'address',
        'contact',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'employee_count',
        'inventory_count',
        'low_stock_count',
    ];

    public function employees()
    {
        return $this->hasMany(\App\Models\Employee::class, 'branch_id', 'branch_id');
    }

    public function inventory()
    {
        return $this->hasMany(\App\Models\Inventory::class, 'branch_id', 'branch_id');
    }

    public function sales()
    {
        return $this->hasMany(\App\Models\Sale::class, 'branch_id', 'branch_id');
    }

    public function purchaseOrders()
    {
        return $this->hasMany(\App\Models\PurchaseOrder::class, 'branch_id', 'branch_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function getEmployeeCountAttribute()
    {
        return collect($this->employees ?? [])->count(); // Use collect or relation count safely
    }

    public function getInventoryCountAttribute()
    {
        try {
            return $this->inventory()->count();
        } catch (\Exception $e) {
            return 0; // fallback if inventory model is not fully instantiated yet
        }
    }

    public function getLowStockCountAttribute()
    {
        try {
            return $this->inventory()->where('quantity', '<=', 10)->count();
        } catch (\Exception $e) {
            return 0;
        }
    }
}
