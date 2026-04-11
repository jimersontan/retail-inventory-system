<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'user_type' => $this->user_type,
            'employee' => $this->whenLoaded('employee', function () {
                return [
                    'employee_id' => $this->employee->employee_id,
                    'position' => $this->employee->position,
                    'branch' => $this->employee->relationLoaded('branch') && $this->employee->branch
                        ? [
                            'branch_id' => $this->employee->branch->branch_id,
                            'name' => $this->employee->branch->name
                        ]
                        : null,
                    'role' => $this->employee->relationLoaded('role') && $this->employee->role
                        ? [
                            'role_id' => $this->employee->role->role_id,
                            'role_name' => $this->employee->role->role_name
                        ]
                        : null,
                ];
            }),
        ];
    }
}
