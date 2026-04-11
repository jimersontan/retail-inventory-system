<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'sale_id' => $this->sale_id,
            'branch_id' => $this->branch_id,
            'user_id' => $this->user_id,
            'employee_id' => $this->employee_id,
            'sale_date' => optional($this->sale_date)->toDateTimeString(),
            'sale_amount' => $this->total_amount,
            'payment_method' => $this->payment_method,
            'items_count' => $this->whenLoaded('details', function () {
                return $this->details->sum('quantity');
            }),
            'branch' => new BranchResource($this->whenLoaded('branch')),
            'user' => new UserResource($this->whenLoaded('user')),
            'employee' => new EmployeeResource($this->whenLoaded('employee')),
            'details' => SaleDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at,
        ];
    }
}
