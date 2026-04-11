<?php

namespace App\Http\Requests\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;

class ReceiveItemsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'items' => 'required|array',
            'items.*.po_detail_id' => 'required|exists:purchase_order_details,po_detail_id',
            'items.*.quantity_received' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
