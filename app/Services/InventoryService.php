<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Atomically move stock quantity inside a lock transaction.
     */
    public function move(int $inventoryId, int $qty, string $type, ?string $refType = null, ?int $refId = null, ?string $notes = null): void
    {
        DB::transaction(function () use ($inventoryId, $qty, $type, $refType, $refId, $notes) {
            $employeeId = null;
            if (auth()->check()) {
                $employeeId = optional(auth()->user()->employee)->employee_id;
            }

            // lockForUpdate prevents race conditions on parallel adjustments
            $inv = Inventory::lockForUpdate()->find($inventoryId);
            
            if (!$inv) {
                throw new \Exception("Inventory record not found.");
            }

            if ($type === 'in') {
                $inv->increment('quantity', $qty);
            } else {
                $inv->decrement('quantity', $qty);
            }

            // Manually touching the updated timestamp since decrement/increment may bypass standard Eloquent updates depending on setup
            $inv->last_updated = now();
            $inv->save();

            StockMovement::create([
                'inventory_id'   => $inventoryId,
                'movement_type'  => $type,
                'quantity'       => $qty,
                'reference_type' => $refType,
                'reference_id'   => $refId,
                'moved_by'       => $employeeId,
                'movement_date'  => now(),
                'notes'          => $notes,
            ]);
        });
    }

    /**
     * Compute explicit adjustment differentials.
     */
    public function adjust(int $inventoryId, int $signedQty, string $reason, ?string $notes = null): void
    {
        if ($signedQty === 0) {
            return;
        }

        $type = $signedQty > 0 ? 'in' : 'out';
        $qty = abs($signedQty);

        // Map reason into reference_type for simplicity, as adjustment acts as its own refType context here.
        // E.g., reference_type = 'adjustment', but we concat reason into notes natively if requested, or map it.
        // Actually, the prompt rules: "call move() with refType='adjustment'".
        
        $finalNotes = "Reason: {$reason}";
        if ($notes) {
            $finalNotes .= " | Notes: " . $notes;
        }

        $this->move($inventoryId, $qty, $type, 'adjustment', null, $finalNotes);
    }
}
