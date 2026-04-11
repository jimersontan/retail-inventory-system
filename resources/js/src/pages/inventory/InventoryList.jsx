import React, { useEffect, useState } from 'react';
import { Package, CheckCircle, AlertTriangle, XCircle, Search, SlidersHorizontal, Eye, ClipboardList, Building2, Warehouse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useBranchStore } from '../../store/branchStore';
import { useCategoryStore } from '../../store/categoryStore';
import useBranchScope from '../../hooks/useBranchScope';
import StockLevelBadge from '../../components/inventory/StockLevelBadge';
import StockBar from '../../components/inventory/StockBar';
import StockAdjustModal from './StockAdjustModal';
import MovementsDrawer from './MovementsDrawer';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const InventoryList = () => {
    const navigate = useNavigate();
    const { isAdmin, isManager } = useBranchScope();
    const canEdit = isAdmin || isManager;
    
    const { inventory, pagination, fetchInventory, loading } = useInventoryStore();
    const { branches, fetchBranches } = useBranchStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [branchId, setBranchId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stockLevel, setStockLevel] = useState('all');

    const [adjustItem, setAdjustItem] = useState(null);
    const [drawerItem, setDrawerItem] = useState(null);

    useEffect(() => {
        if (canEdit && branches.length === 0) fetchBranches();
        if (categories.length === 0) fetchCategories();
    }, [canEdit]);

    useEffect(() => {
        const params = { page: pagination.currentPage };
        if (debouncedSearch) params.search = debouncedSearch;
        if (canEdit && branchId) params.branch_id = branchId;
        if (categoryId) params.category_id = categoryId;
        if (stockLevel !== 'all') params.stock_level = stockLevel;
        
        fetchInventory(params);
    }, [debouncedSearch, branchId, categoryId, stockLevel, pagination.currentPage, adjustItem]); 

    const flatCategories = categories.reduce((acc, cat) => {
        acc.push(cat);
        if (cat.children) cat.children.forEach(sub => acc.push({...sub, isSub: true}));
        return acc;
    }, []);

    const inStock = inventory.filter(i => i.stock_level === 'in_stock').length;
    const lowStock = inventory.filter(i => i.stock_level === 'low_stock').length;
    const outStock = inventory.filter(i => i.stock_level === 'out_of_stock').length;
    const hasActiveFilters = searchTerm || branchId || categoryId || stockLevel !== 'all';

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Track stock levels across all branches</p>
                </div>
                {canEdit && (
                    <button 
                        onClick={() => {
                            if(inventory.length > 0) setAdjustItem(inventory[0]);
                            else toast.error("No items to adjust");
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Adjust Stock
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total SKUs Tracked</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{pagination.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 shrink-0">
                        <Package className="w-5 h-5 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{inStock}+</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{lowStock}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Out of Stock</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{outStock}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 shrink-0">
                        <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search product name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                
                {canEdit && (
                    <select
                        className="w-44 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-600"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                        ))}
                    </select>
                )}

                <select
                    className="w-40 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-600"
                    value={stockLevel}
                    onChange={(e) => setStockLevel(e.target.value)}
                >
                    <option value="all">All Stock Levels</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>

                <select
                    className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-600"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">Categories</option>
                    {flatCategories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                            {cat.isSub ? `— ${cat.category_name}` : cat.category_name}
                        </option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button 
                        onClick={() => { setSearchTerm(''); setBranchId(''); setCategoryId(''); setStockLevel('all'); }}
                        className="text-[11px] uppercase tracking-wider font-bold text-indigo-500 hover:text-indigo-700 ml-1 px-2"
                    >
                        Reset
                    </button>
                )}
                
                <span className="ml-auto text-sm font-semibold text-slate-400 hidden lg:inline-block pl-2">
                    {pagination.total} items
                </span>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-center py-20 flex flex-col items-center">
                    <div className="w-10 h-10 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                    </div>
                </div>
            ) : inventory.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 text-center py-20">
                    <Warehouse className="w-16 h-16 text-slate-200 mx-auto" />
                    <p className="text-slate-500 font-medium mt-4">No inventory records found</p>
                    <p className="text-sm text-slate-400 mt-1">Try resetting your filters or adjusting search terms.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Branch</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4 w-40">Current Stock</th>
                                    <th className="px-6 py-4">Max Stock</th>
                                    <th className="px-6 py-4">Stock Level</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    {canEdit && <th className="px-6 py-4">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inventory.map((inv) => (
                                    <tr key={inv.inventory_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 w-max">
                                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Package className="text-slate-400 w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{inv.product?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{inv.product?.category?.category_name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center w-max">
                                                <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                <span className="text-sm font-semibold text-slate-600">{inv.branch?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-semibold tracking-tight bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500 shrink-0">
                                                {inv.product?.unique_sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StockBar qty={inv.quantity} max={inv.max_stock} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-500">{inv.max_stock} units</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StockLevelBadge level={inv.stock_level} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-semibold text-slate-400 w-max bg-slate-50 px-2 py-1 rounded hidden lg:inline-block group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                                                {new Date(inv.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => navigate(`/products/${inv.product_id}`)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100" 
                                                        title="View Product"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setAdjustItem(inv)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-100" 
                                                        title="Adjust Stock"
                                                    >
                                                        <SlidersHorizontal className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDrawerItem(inv)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100" 
                                                        title="View Movements"
                                                    >
                                                        <ClipboardList className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <StockAdjustModal 
                isOpen={!!adjustItem} 
                onClose={() => setAdjustItem(null)} 
                inventoryItem={adjustItem} 
            />

            <MovementsDrawer 
                isOpen={!!drawerItem} 
                onClose={() => setDrawerItem(null)} 
                inventoryItem={drawerItem} 
            />

        </div>
    );
};

export default InventoryList;
