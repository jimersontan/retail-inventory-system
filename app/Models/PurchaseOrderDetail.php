<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderDetail extends Model
{
    use HasFactory;

    protected $table = 'purchase_order_details';
    protected $primaryKey = 'po_detail_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'po_id',
        'product_id',
        'quantity_ordered',
        'quantity_received',
        'unit_price',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
    ];

    protected $appends = ['remaining_qty', 'subtotal', 'is_fully_received'];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_id', 'po_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function getRemainingQtyAttribute()
    {
        return max(0, (int) $this->quantity_ordered - (int) $this->quantity_received);
    }

    public function getSubtotalAttribute()
    {
        return round(((float) $this->unit_price) * ((int) $this->quantity_ordered), 2);
    }

    public function getIsFullyReceivedAttribute()
    {
        return (int) $this->quantity_received >= (int) $this->quantity_ordered;
    }
}
