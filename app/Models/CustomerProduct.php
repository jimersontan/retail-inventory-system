<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerProduct extends Model
{
    use HasFactory;

    protected $primaryKey = 'seller_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'seller_id',
        'product_id',
        'stock_offset',
        'stock_qty',
        'is_available',
        'listed_at',
        'updated_at',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'stock_offset' => 'decimal:2',
        'listed_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['listed_price'];

    /**
     * Relationship: Belongs to Customer (seller)
     */
    public function seller()
    {
        return $this->belongsTo(Customer::class, 'seller_id', 'customer_id');
    }

    /**
     * Relationship: Belongs to Product
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Accessor: Compute listed price (base price + offset)
     */
    public function getListedPriceAttribute()
    {
        return $this->product ? $this->product->price + $this->stock_offset : 0;
    }

    /**
     * Scope: Get available listings only
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope: Filter by seller (customer)
     */
    public function scopeBySeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }
}
