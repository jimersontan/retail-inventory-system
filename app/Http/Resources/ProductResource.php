<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        $isAdminOrManager = false;
        if (auth()->check()) {
             $type = auth()->user()->user_type;
             $isAdminOrManager = in_array($type, ['admin', 'manager']);
        }

        return [
            'product_id' => $this->product_id,
            'name' => $this->name,
            'flavor_option' => $this->flavor_option,
            'unique_sku' => $this->unique_sku,
            'category_id' => $this->category_id,
            'supplier_id' => $this->supplier_id,
            'unit' => $this->unit,
            'price' => $this->price,
            // Cost price is hidden per spec rules via API layer culling
            'cost_price' => $this->when($isAdminOrManager, $this->cost_price),
            'status' => $this->status,
            'average_rating' => $this->average_rating,
            'total_stock' => $this->total_stock,
            'image_url' => $this->image ? url(\Illuminate\Support\Facades\Storage::url($this->image)) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'category' => new CategoryResource($this->whenLoaded('category')),
            'inventory' => $this->whenLoaded('inventory'), 
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
