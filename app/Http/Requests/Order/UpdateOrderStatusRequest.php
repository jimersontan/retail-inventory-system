<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && in_array(auth()->user()->user_type, ['admin', 'manager', 'cashier']);
    }

    public function rules()
    {
        return [
            'status' => 'required|in:confirmed,processing,ready,completed,cancelled',
        ];
    }

    public function messages()
    {
        return [
            'status.in' => 'Invalid order status',
        ];
    }
}
