<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_orders';
    protected $primaryKey = 'po_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'supplier_id',
        'branch_id',
        'created_by',
        'order_date',
        'expected_date',
        'approved_case',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    protected $appends = ['is_overdue', 'received_percentage'];

    public function supplier()
    {
        return $this->belongsTo(Customer::class, 'supplier_id', 'customer_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function details()
    {
        return $this->hasMany(PurchaseOrderDetail::class, 'po_id', 'po_id');
    }

    public function scopeByStatus($query, $status)
    {
        if (!$status || $status === 'all') {
            return $query;
        }

        return $query->where('status', $status);
    }

    public function scopeByBranch($query, $branchId)
    {
        if (!$branchId) {
            return $query;
        }

        return $query->where('branch_id', $branchId);
    }

    public function getIsOverdueAttribute()
    {
        if (!$this->expected_date) {
            return false;
        }

        if (in_array($this->status, ['received', 'cancelled'])) {
            return false;
        }

        return Carbon::parse($this->expected_date)->lt(Carbon::today());
    }

    public function getReceivedPercentageAttribute()
    {
        $ordered = (int) $this->details()->sum('quantity_ordered');
        $received = (int) $this->details()->sum('quantity_received');

        if ($ordered <= 0) {
            return 0;
        }

        return round(($received / $ordered) * 100, 2);
    }

    public function syncStatus()
    {
        if ($this->status === 'cancelled') {
            return $this;
        }

        $ordered = (int) $this->details()->sum('quantity_ordered');
        $received = (int) $this->details()->sum('quantity_received');

        // Status machine transitions after receiving.
        if ($ordered > 0 && $received >= $ordered) {
            $this->status = 'received';
        } elseif ($received > 0) {
            $this->status = 'partially_received';
        }

        $this->save();

        return $this;
    }
}
