<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'review_id' => $this->review_id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'review_time' => $this->review_date instanceof \Carbon\Carbon ? $this->review_date->toIso8601String() : $this->review_date,
            
            'user' => $this->whenLoaded('user', function () {
                return [
                    'user_id' => $this->user->user_id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'initials' => strtoupper(implode('', array_map(function ($part) {
                        return $part[0] ?? '';
                    }, explode(' ', $this->user->name)))),
                ];
            }),
            
            'product' => $this->whenLoaded('product', function () {
                return [
                    'product_id' => $this->product->product_id,
                    'name' => $this->product->name,
                    'unique_sku' => $this->product->unique_sku,
                ];
            }),
        ];
    }
}
