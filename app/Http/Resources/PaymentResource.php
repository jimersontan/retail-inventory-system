<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'payment_id' => $this->payment_id,
            'order_id' => $this->order_id,
            'amount' => (float)$this->amount,
            'method' => $this->method,
            'status' => $this->status,
            'payment_date' => $this->payment_date instanceof \Carbon\Carbon ? $this->payment_date->format('Y-m-d H:i:s') : $this->payment_date,
        ];
    }
}
