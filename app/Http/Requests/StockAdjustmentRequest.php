<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockAdjustmentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'inventory_id' => 'required|integer|exists:inventory,inventory_id',
            'quantity' => 'required|integer|not_in:0',
            'reason' => 'required|string|in:damaged,theft,count_correction,transfer,expired,other',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
