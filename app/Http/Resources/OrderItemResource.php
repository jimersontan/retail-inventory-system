<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'item_id' => $this->item_id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'unit_price' => (float)$this->unit_price,
            'subtotal' => (float)$this->subtotal,
            'product' => $this->whenLoaded('product', fn() => [
                'product_id' => $this->product->product_id,
                'name' => $this->product->name,
                'price' => (float)$this->product->price,
                'image_url' => $this->product->image_url,
            ]),
            'created_at' => $this->created_at instanceof \Carbon\Carbon ? $this->created_at->format('Y-m-d H:i:s') : $this->created_at,
            'updated_at' => $this->updated_at instanceof \Carbon\Carbon ? $this->updated_at->format('Y-m-d H:i:s') : $this->updated_at,
        ];
    }
}
