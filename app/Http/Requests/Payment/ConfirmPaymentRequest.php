<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmPaymentRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && auth()->user()->user_type === 'customer';
    }

    public function rules()
    {
        return [
            'method' => 'required|in:cash,gcash,card',
            'reference_number' => 'required_if:method,gcash|nullable|string|max:255',
        ];
    }

    public function messages()
    {
        return [
            'method.in' => 'Invalid payment method',
            'reference_number.required_if' => 'GCash reference number is required',
        ];
    }
}
