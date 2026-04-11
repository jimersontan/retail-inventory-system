<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'po_detail_id' => $this->po_detail_id,
            'po_id' => $this->po_id,
            'product_id' => $this->product_id,
            'quantity_ordered' => $this->quantity_ordered,
            'quantity_received' => $this->quantity_received,
            'remaining_qty' => $this->remaining_qty,
            'unit_price' => $this->unit_price,
            'subtotal' => $this->subtotal,
            'is_fully_received' => $this->is_fully_received,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
