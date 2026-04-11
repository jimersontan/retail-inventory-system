<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request)
    {
        $isAdmin = auth()->check() && auth()->user()->user_type === 'admin';

        return [
            'employee_id' => $this->employee_id,
            'user_id' => $this->user_id,
            'branch_id' => $this->branch_id,
            'role_id' => $this->role_id,
            'position' => $this->position,
            'hire_date' => $this->hire_date,
            'salary' => $this->when($isAdmin, $this->salary),
            'status' => $this->status,

            'user' => new UserResource($this->whenLoaded('user')),
            'branch' => new BranchResource($this->whenLoaded('branch')),
            'role' => $this->whenLoaded('role'),
            'profile' => $this->whenLoaded('profile'),
        ];
    }
}
