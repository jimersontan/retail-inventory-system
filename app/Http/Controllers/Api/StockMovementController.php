<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use App\Http\Resources\StockMovementResource;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with(['movedBy', 'inventory.product']);

        if ($request->has('inventory_id') && $request->inventory_id != '') {
            $query->where('inventory_id', $request->inventory_id);
        }

        if ($request->has('movement_type') && $request->movement_type !== 'all') {
            $query->where('movement_type', $request->movement_type);
        }

        $movements = $query->latest('movement_date')->paginate(15);
        
        return StockMovementResource::collection($movements);
    }
}
