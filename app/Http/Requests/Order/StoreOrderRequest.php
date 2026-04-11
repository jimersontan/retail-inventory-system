<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && auth()->user()->user_type === 'customer';
    }

    public function rules()
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,product_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'branch_id' => 'required|integer|exists:branches,branch_id',
            'payment_method' => 'required|in:cash,gcash,card',
        ];
    }

    public function messages()
    {
        return [
            'items.required' => 'At least one item is required',
            'items.array' => 'Items must be an array',
            'items.min' => 'Please add at least one item to your order',
            'items.*.product_id.exists' => 'One or more products are invalid',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'branch_id.exists' => 'Invalid branch selected',
            'payment_method.in' => 'Payment method must be cash, gcash, or card',
        ];
    }
}
