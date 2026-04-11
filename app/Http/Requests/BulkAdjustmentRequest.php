<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkAdjustmentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'branch_id' => 'required|integer|exists:branches,branch_id',
            'reason' => 'required|string|in:damaged,theft,count_correction,transfer,expired,other',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.inventory_id' => 'required|integer|exists:inventory,inventory_id',
            'items.*.type' => 'required|string|in:in,out',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:255',
        ];
    }

    public function messages()
    {
        return [
            'branch_id.required' => 'Branch is required',
            'branch_id.exists' => 'Selected branch does not exist',
            'reason.required' => 'Adjustment reason is required',
            'reason.in' => 'Invalid adjustment reason',
            'items.required' => 'At least one product must be added',
            'items.min' => 'At least one product must be added',
            'items.*.inventory_id.required' => 'Product is required for all items',
            'items.*.inventory_id.exists' => 'Selected product does not exist',
            'items.*.type.required' => 'Type (Add/Remove) is required for all items',
            'items.*.type.in' => 'Type must be either Add or Remove',
            'items.*.quantity.required' => 'Quantity is required for all items',
            'items.*.quantity.min' => 'Quantity must be at least 1',
        ];
    }
}
