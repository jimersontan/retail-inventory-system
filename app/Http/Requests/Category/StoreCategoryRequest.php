<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'category_name' => 'required|string|max:255|unique:categories,category_name',
            'description' => 'nullable|string',
            'parent_category_id' => 'nullable|exists:categories,category_id',
            'is_active' => 'boolean',
        ];
    }
}
