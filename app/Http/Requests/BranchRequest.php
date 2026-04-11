<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BranchRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255|unique:branches',
            'address' => 'required|string|max:255',
            'contact' => 'required|string|max:20',
            'type' => 'required|in:main,satellite',
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $branchId = $this->route('id');
            $rules['name'] = 'required|string|max:255|unique:branches,name,' . $branchId . ',branch_id';
        }

        return $rules;
    }
}
