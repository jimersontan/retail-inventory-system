<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $primaryKey = 'customer_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'branch_id',
        'store_name',
        'status',
        'verified_at',
        'joined_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'joined_at' => 'datetime',
    ];

    protected $appends = ['is_verified'];

    /**
     * Relationship: Belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Relationship: Belongs to Branch
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    /**
     * Relationship: Customer's reseller listings (HasMany CustomerProduct)
     */
    public function listings()
    {
        return $this->hasMany(CustomerProduct::class, 'seller_id', 'customer_id');
    }

    /**
     * Relationship: Orders placed by this customer
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'user_id');
    }

    /**
     * Relationship: Reviews written by this customer
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id', 'user_id');
    }

    /**
     * Accessor: Check if customer account is verified
     */
    public function getIsVerifiedAttribute()
    {
        return !is_null($this->verified_at);
    }

    /**
     * Scope: Filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by branch (for managers)
     */
    public function scopeByBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Scope: Filter by verification status
     */
    public function scopeVerified($query, $verified = true)
    {
        if ($verified) {
            return $query->whereNotNull('verified_at');
        }
        return $query->whereNull('verified_at');
    }
}
