<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'customer_id' => $this->customer_id,
            'user_id' => $this->user_id,
            'branch_id' => $this->branch_id,
            'store_name' => $this->store_name,
            'status' => $this->status,
            'is_verified' => $this->is_verified,
            'verified_at' => $this->verified_at,
            'joined_at' => $this->joined_at,
            
            'user' => $this->whenLoaded('user', function () {
                return [
                    'user_id' => $this->user->user_id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone ?? null,
                    'address' => $this->user->address ?? null,
                ];
            }),
            
            'branch' => $this->whenLoaded('branch', function () {
                return [
                    'branch_id' => $this->branch->branch_id,
                    'name' => $this->branch->name,
                ];
            }),
            
            'listings' => $this->whenLoaded('listings', function () {
                return CustomerProductResource::collection($this->listings);
            }),
        ];
    }
}
