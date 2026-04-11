<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $userId = $this->route('id'); // Assuming route parameter is :id which is customer_id
        
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $userId . ',user_id',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'store_name' => 'nullable|string|max:255',
        ];
    }
}
