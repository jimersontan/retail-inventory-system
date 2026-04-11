<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        // the ID can be passed in 'category' or 'id' param depending on route name
        $categoryId = $this->route('category') ?: $this->route('id');

        return [
            'category_name' => 'required|string|max:255|unique:categories,category_name,' . $categoryId . ',category_id',
            'description' => 'nullable|string',
            'parent_category_id' => 'nullable|exists:categories,category_id|not_in:' . $categoryId, 
            'is_active' => 'boolean',
        ];
    }
}
