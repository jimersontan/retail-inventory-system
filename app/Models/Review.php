<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $primaryKey = 'review_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
        'review_date',
    ];

    protected $casts = [
        'rating' => 'integer',
        'review_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Scope: Filter reviews by product
     */
    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope: Filter reviews by rating
     */
    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeByDateRange($query, $from, $to)
    {
        if ($from) {
            $query->where('review_date', '>=', $from);
        }
        if ($to) {
            $query->where('review_date', '<=', $to);
        }
        return $query;
    }
}
