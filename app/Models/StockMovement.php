<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Employee;

class StockMovement extends Model
{
    use HasFactory;

    protected $table = 'stock_movements';

    protected $primaryKey = 'movement_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'inventory_id',
        'movement_type',
        'quantity',
        'reference_type',
        'reference_id',
        'moved_by',
        'movement_date',
        'notes',
    ];

    protected $casts = [
        'movement_date' => 'datetime',
        'quantity' => 'integer',
        // Note: movement_type is an ENUM column ('in', 'out', 'adjustment')
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id', 'inventory_id');
    }

    public function movedBy()
    {
        return $this->belongsTo(Employee::class, 'moved_by', 'employee_id');
    }
}
