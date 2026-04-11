<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'inventory_id' => $this->inventory_id,
            'branch_id' => $this->branch_id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'init_stock' => $this->init_stock,
            'max_stock' => $this->max_stock,
            'last_updated' => $this->last_updated,
            'stock_level' => $this->stock_level,
            'stock_percentage' => $this->stock_percentage,

            'product' => new ProductResource($this->whenLoaded('product')),
            'branch' => $this->whenLoaded('branch'),
            'movements' => StockMovementResource::collection($this->whenLoaded('movements')),
        ];
    }
}
