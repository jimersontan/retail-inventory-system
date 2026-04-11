<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'category_id' => $this->category_id,
            'category_name' => $this->category_name,
            'description' => $this->description,
            'parent_category_id' => $this->parent_category_id,
            'is_active' => $this->is_active,
            'product_count' => $this->product_count,
            'sub_category_count' => $this->sub_category_count,

            'parent' => new CategoryResource($this->whenLoaded('parent')),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
