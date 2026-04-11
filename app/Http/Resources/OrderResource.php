<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,
            'branch_id' => $this->branch_id,
            'total_amount' => (float)$this->total_amount,
            'status' => $this->status,
            'order_date' => $this->order_date instanceof \Carbon\Carbon 
                ? $this->order_date->format('Y-m-d H:i:s') 
                : ($this->order_date ? (string)$this->order_date : null),
            'is_cancellable' => $this->is_cancellable,
            'payment_status' => $this->payment_status,
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'branch' => $this->whenLoaded('branch', fn() => [
                'branch_id' => $this->branch->branch_id,
                'name' => $this->branch->name,
                'address' => $this->branch->address ?? null,
            ]),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'created_at' => $this->created_at instanceof \Carbon\Carbon ? $this->created_at->format('Y-m-d H:i:s') : $this->created_at,
            'updated_at' => $this->updated_at instanceof \Carbon\Carbon ? $this->updated_at->format('Y-m-d H:i:s') : $this->updated_at,
        ];
    }
}
