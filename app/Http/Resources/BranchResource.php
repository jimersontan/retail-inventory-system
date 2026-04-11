<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BranchResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'branch_id' => $this->branch_id,
            'name' => $this->name,
            'address' => $this->address,
            'contact' => $this->contact,
            'type' => $this->type,
            'is_active' => (bool)$this->is_active,
            'employee_count' => $this->employee_count,
            'inventory_count' => $this->inventory_count,
            'low_stock_count' => $this->low_stock_count,
            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),
            'inventory' => $this->whenLoaded('inventory'),
        ];
    }
}
