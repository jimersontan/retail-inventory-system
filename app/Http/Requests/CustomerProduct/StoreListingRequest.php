<?php

namespace App\Http\Requests\CustomerProduct;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'product_id' => 'required|exists:products,product_id',
            'stock_offset' => 'required|numeric',
            'stock_qty' => 'required|integer|min:0',
            'is_available' => 'sometimes|boolean',
        ];
    }
}
