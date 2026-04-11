import React, { useState, useEffect } from 'react';
import { X, ClipboardList, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';

const MovementsDrawer = ({ isOpen, onClose, inventoryItem }) => {
    const { fetchMovements, movements, movementsLoading, movementsPagination } = useInventoryStore();
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (isOpen && inventoryItem) {
            fetchMovements({ inventory_id: inventoryItem.inventory_id, movement_type: activeTab === 'all' ? '' : activeTab });
        }
    }, [isOpen, inventoryItem, activeTab]);

    const handleLoadMore = () => {
        // Simple log interaction mapping bounds for pagination in drawer
    };

    if (!isOpen || !inventoryItem) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            <div className={`relative w-96 max-w-[90vw] h-[100dvh] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center">
                        <ClipboardList className="text-purple-600 w-5 h-5 mr-3 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-base font-semibold text-slate-900 leading-tight">Stock Movements</p>
                            <p className="text-sm text-slate-400 mt-0.5 truncate max-w-[200px]" title={inventoryItem.product?.name}>
                                {inventoryItem.product?.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0 no-scrollbar bg-white">
                    {['all', 'in', 'out', 'adjustment'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-white">
                    {movementsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : movements.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-8">No movements found matching filters.</p>
                    ) : (
                        movements.map((m) => {
                            const isAdd = m.movement_type === 'in';
                            const isSubtract = m.movement_type === 'out';
                            const isAdjust = m.movement_type === 'adjustment';

                            let Icon = ArrowDownToLine;
                            let iconBg = 'bg-emerald-100';
                            let iconColor = 'text-emerald-600';
                            let valPrefix = '+';
                            let valColor = 'text-emerald-600';

                            if (isSubtract) {
                                Icon = ArrowUpFromLine;
                                iconBg = 'bg-red-100';
                                iconColor = 'text-red-600';
                                valPrefix = '-';
                                valColor = 'text-red-600';
                            } else if (isAdjust) {
                                Icon = SlidersHorizontal;
                                iconBg = 'bg-amber-100';
                                iconColor = 'text-amber-600';
                                valPrefix = m.quantity > 0 ? '+' : '±';
                                valColor = 'text-amber-600';
                            }

                            return (
                                <div key={m.movement_id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 transition-hover hover:border-slate-200 hover:shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                                                <Icon className={`w-4 h-4 ${iconColor}`} />
                                            </div>
                                            <div>
                                                <p className={`text-base font-bold tracking-tight ${valColor}`}>
                                                    {valPrefix}{m.quantity}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5 capitalize font-medium">
                                                    {m.reference_type === 'adjustment' ? 'Manual adjustment' : (m.reference_type ? `Via ${m.reference_type}` : 'System adjustment')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                                {new Date(m.movement_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mt-0.5">
                                                {new Date(m.movement_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs text-slate-600 font-medium mt-1 truncate max-w-[100px]" title={m.moved_by_user?.name}>
                                                by {m.moved_by_user?.name || 'System'}
                                            </p>
                                        </div>
                                    </div>
                                    {m.notes && (
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm leading-relaxed overflow-wrap break-word">
                                                "{m.notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <p className="text-sm font-medium text-slate-500 text-center mb-3">
                        Showing {movements.length} of {movementsPagination.total || movements.length} movements
                    </p>
                    {movementsPagination.currentPage < movementsPagination.lastPage && (
                        <button 
                            onClick={handleLoadMore}
                            className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm"
                        >
                            Load More History
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MovementsDrawer;
