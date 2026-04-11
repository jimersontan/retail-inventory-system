<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'seller_id' => $this->seller_id,
            'product_id' => $this->product_id,
            'stock_offset' => (float) $this->stock_offset,
            'stock_qty' => $this->stock_qty,
            'is_available' => $this->is_available,
            'listed_price' => $this->listed_price,
            'listed_at' => $this->listed_at,
            'updated_at' => $this->updated_at,
            
            'product' => $this->whenLoaded('product', function () {
                return [
                    'product_id' => $this->product->product_id,
                    'name' => $this->product->name,
                    'unique_sku' => $this->product->unique_sku,
                    'price' => (float) $this->product->price,
                ];
            }),
        ];
    }
}
