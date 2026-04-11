import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Package, Minus, Plus, Hammer, ShieldAlert, ClipboardCheck, ArrowLeftRight, Clock, MoreHorizontal, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInventoryStore } from '../../store/inventoryStore';
import StockLevelBadge from '../../components/inventory/StockLevelBadge';

const PREDEFINED_REASONS = [
    { id: 'damaged', label: 'Damaged', icon: Hammer, color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 'theft', label: 'Theft', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'count_correction', label: 'Count Correction', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'text-teal-600', bg: 'bg-teal-100' },
    { id: 'expired', label: 'Expired', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-600', bg: 'bg-slate-100' },
];

const StockAdjustModal = ({ isOpen, onClose, inventoryItem }) => {
    const { adjustStock } = useInventoryStore();
    const [changeQty, setChangeQty] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setChangeQty('');
            setReason('');
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen || !inventoryItem) return null;

    const currentQty = Number(inventoryItem.quantity) || 0;
    const changeVal = Number(changeQty) || 0;
    const newQty = currentQty + changeVal;

    let preColor = 'text-slate-500';
    if (changeVal > 0) preColor = 'text-emerald-600';
    else if (changeVal < 0) preColor = 'text-red-600';

    const handleIncrement = () => setChangeQty(String(changeVal + 1));
    const handleDecrement = () => setChangeQty(String(changeVal - 1));

    const handleSubmit = async () => {
        if (!changeQty || changeVal === 0) {
            toast.error('Quantity change cannot be 0');
            return;
        }
        if (!reason) {
            toast.error('Please select a reason');
            return;
        }
        if (newQty < 0) {
            toast.error('Final stock cannot be negative');
            return;
        }

        setLoading(true);
        try {
            await adjustStock({
                inventory_id: inventoryItem.inventory_id,
                quantity: changeVal,
                reason,
                notes
            });
            toast.success('Stock adjusted successfully');
            onClose();
        } catch (error) {
            // Error toasts are handled securely natively mapped Boundary map limits
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <SlidersHorizontal className="text-amber-500 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">Adjust Stock</p>
                            <p className="text-sm text-slate-500 mt-0.5">Manually correct inventory quantity</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="mx-6 mt-5 bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="text-indigo-500 w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <p className="text-sm font-semibold text-slate-900 truncate" title={inventoryItem.product?.name}>
                                {inventoryItem.product?.name}
                            </p>
                            <p className="font-mono text-xs text-slate-400 mt-0.5">{inventoryItem.product?.unique_sku}</p>
                            <p className="text-xs text-slate-500 mt-1">Current stock: {currentQty} units</p>
                        </div>
                        <div className="shrink-0 flex self-start">
                            <StockLevelBadge level={inventoryItem.stock_level} />
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-5">
                        
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Quantity Change <span className="text-red-500">*</span></label>
                            <p className="text-xs text-slate-400 mb-2">Use positive number to add, negative to remove</p>
                            
                            <div className="relative flex items-center gap-3">
                                <button type="button" onClick={handleDecrement} className="w-10 h-11 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors shrink-0">
                                    <Minus className="text-slate-600 w-4 h-4" />
                                </button>
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={changeQty}
                                    onChange={(e) => setChangeQty(e.target.value)}
                                    className="text-center font-bold text-lg h-11 flex-1 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-w-0"
                                />
                                <button type="button" onClick={handleIncrement} className="w-10 h-11 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors shrink-0">
                                    <Plus className="text-slate-600 w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-slate-50 text-slate-700 rounded-lg px-4 py-3 flex items-center justify-between mt-3 border border-slate-100 shadow-inner">
                                <span className="text-xs font-medium text-slate-500">New stock will be:</span>
                                <span className={`text-sm font-bold ${preColor}`}>{newQty} units</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-2">Reason <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-2">
                                {PREDEFINED_REASONS.map((r) => {
                                    const isSelected = reason === r.id;
                                    const RIcon = r.icon;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setReason(r.id)}
                                            className={`border-2 rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col items-start ${
                                                isSelected ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg mb-2 flex items-center justify-center shrink-0 ${r.bg}`}>
                                                <RIcon className={`w-4 h-4 ${r.color}`} />
                                            </div>
                                            <p className={`text-xs font-medium line-clamp-1 ${isSelected ? 'text-indigo-800' : 'text-slate-600'}`}>
                                                {r.label}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Notes <span className="text-xs text-slate-400 ml-1 font-normal">(Optional)</span>
                            </label>
                            <textarea 
                                rows={2}
                                placeholder="Additional notes about this adjustment..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit} 
                        disabled={loading || changeVal === 0 || !reason}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Adjustment
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StockAdjustModal;
