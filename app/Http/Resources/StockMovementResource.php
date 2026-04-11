<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'movement_id' => $this->movement_id,
            'inventory_id' => $this->inventory_id,
            'movement_type' => $this->movement_type,
            'quantity' => $this->quantity,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'moved_by' => $this->moved_by,
            // Keep movement_time key for frontend compatibility.
            'movement_time' => optional($this->movement_date)->toDateTimeString(),
            'notes' => $this->notes,

            'inventory' => new InventoryResource($this->whenLoaded('inventory')),
            'moved_by_user' => $this->whenLoaded('movedBy', function() {
                return [
                    'name' => optional($this->movedBy->user)->name
                ];
            }),
        ];
    }
}
