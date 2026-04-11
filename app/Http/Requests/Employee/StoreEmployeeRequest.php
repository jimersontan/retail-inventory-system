<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            // User validations
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'user_type' => 'required|in:admin,manager,cashier',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',

            // Employee validations
            'branch_id' => 'required|exists:branches,branch_id',
            'role_id' => 'required|exists:roles,role_id',
            'position' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,on_leave',

            // Profile validations
            'profile_phone_no' => 'nullable|string|max:20',
            'profile_email' => 'nullable|email|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'zip' => 'nullable|string|max:10',
            'key_field' => 'nullable|string|max:255',
        ];
    }
}
