<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'po_id' => $this->po_id,
            'supplier_id' => $this->supplier_id,
            'branch_id' => $this->branch_id,
            'created_by' => $this->created_by,
            'order_date' => optional($this->order_date)->format('Y-m-d'),
            'expected_date' => optional($this->expected_date)->format('Y-m-d'),
            'approved_case' => $this->approved_case,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'is_overdue' => $this->is_overdue,
            'received_percentage' => $this->received_percentage,
            'items_count' => $this->whenLoaded('details', function () {
                return $this->details->count();
            }),
            'ordered_qty_total' => $this->whenLoaded('details', function () {
                return $this->details->sum('quantity_ordered');
            }),
            'received_qty_total' => $this->whenLoaded('details', function () {
                return $this->details->sum('quantity_received');
            }),
            'supplier' => $this->whenLoaded('supplier', function () {
                return [
                    'customer_id' => $this->supplier->customer_id,
                    'store_name' => $this->supplier->store_name,
                    'user' => $this->supplier->relationLoaded('user') ? [
                        'user_id' => $this->supplier->user->user_id,
                        'name' => $this->supplier->user->name,
                    ] : null,
                ];
            }),
            'branch' => new BranchResource($this->whenLoaded('branch')),
            'created_by_user' => new UserResource($this->whenLoaded('createdBy')),
            'details' => PurchaseOrderDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
