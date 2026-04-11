import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, XCircle, AlertTriangle, LayoutGrid, LayoutList, Search, RotateCcw, Pencil, Eye, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useBranchStore } from '../../store/branchStore';
import useBranchScope from '../../hooks/useBranchScope';
import ProductStatusBadge from '../../components/products/ProductStatusBadge';
import StockBar from '../../components/products/StockBar';
import SKUBadge from '../../components/products/SKUBadge';
import StarRating from '../../components/products/StarRating';
import ProductForm from './ProductForm';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const ProductList = () => {
    const navigate = useNavigate();
    const { isAdmin, isManager, isCashier } = useBranchScope();
    const canEdit = isAdmin || isManager;

    const { products, pagination, loading, viewMode, setViewMode, fetchProducts, updateProductStatus, deleteProduct } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();
    const { branches, fetchBranches } = useBranchStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [categoryId, setCategoryId] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [branchId, setBranchId] = useState('');

    useEffect(() => {
        fetchCategories();
        if (canEdit) fetchBranches();
    }, [canEdit]);

    useEffect(() => {
        const params = { page: pagination.currentPage };
        if (debouncedSearch) params.search = debouncedSearch;
        if (categoryId) params.category_id = categoryId;
        if (statusFilter !== 'all') params.status = statusFilter;
        // Mock branch filter since we mapped inventory loosely
        if (branchId) params.branch_id = branchId;
        
        fetchProducts(params);
    }, [debouncedSearch, categoryId, statusFilter, branchId, pagination.currentPage]);

    // Handle clicking outside dropdown
    useEffect(() => {
        const handleClick = () => setOpenDropdownId(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleCreate = () => {
        setSelectedProduct(null);
        fetchCategories().catch(() => {});
        if (canEdit) fetchBranches().catch(() => {});
        setIsFormOpen(true);
    };

    const handleEdit = (p) => {
        setSelectedProduct(p);
        fetchCategories().catch(() => {});
        if (canEdit) fetchBranches().catch(() => {});
        setIsFormOpen(true);
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateProductStatus(id, status);
            toast.success(`Product marked as ${status}`);
        } catch(e) {}
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to completely delete this product?')) {
            try {
                await deleteProduct(id);
                toast.success('Product deleted');
            } catch(e) {
                toast.error(e.response?.data?.message || 'Delete failed');
            }
        }
    };

    const formatPrice = (p) => Number(p || 0).toLocaleString('en-PH', {minimumFractionDigits: 2});

    // Sub-cat flat map for options
    const flatCategories = categories.reduce((acc, cat) => {
        acc.push(cat);
        if (cat.children) {
            cat.children.forEach(sub => acc.push({...sub, isSub: true}));
        }
        return acc;
    }, []);

    const hasActiveFilters = searchTerm || categoryId || statusFilter !== 'all' || branchId;

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{pagination.total} products across all categories</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                    {canEdit && (
                        <button
                            onClick={handleCreate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <Package className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Add Product</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Products</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{pagination.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50">
                        <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
                {/* Mock stat counts for active/inactive UI mapping */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Available</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{products.filter(p=>p.status==='available').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Out of Stock</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{products.filter(p=>p.total_stock===0).length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
                        <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                </div>
                <div 
                    onClick={() => setStatusFilter('low')}
                    className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
                >
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Low Stock</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{products.filter(p=>p.total_stock <= 10 && p.total_stock > 0).length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[12rem] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                
                <select
                    className="w-44 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 outline-none bg-white"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {flatCategories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                            {cat.isSub ? `— ${cat.category_name}` : cat.category_name}
                        </option>
                    ))}
                </select>

                <select
                    className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 outline-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="discontinued">Discontinued</option>
                </select>

                {canEdit && (
                    <select
                        className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 outline-none bg-white"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                        ))}
                    </select>
                )}

                {hasActiveFilters && (
                    <button 
                        onClick={() => { setSearchTerm(''); setCategoryId(''); setStatusFilter('all'); setBranchId(''); }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium ml-2"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            {loading ? (
                <div className="w-full text-center py-12"><div className="animate-spin w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 mx-auto" /></div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <Package className="w-16 h-16 text-slate-200 mx-auto" />
                    <p className="text-slate-500 font-medium mt-4 text-base">No products found</p>
                    <p className="text-slate-400 text-sm mt-1">Try a different search or filter</p>
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-visible shadow-sm">
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((p) => (
                                    <tr key={p.product_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="text-slate-300 w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 line-clamp-1 break-all" title={p.name}>{p.name}</p>
                                                    <p className="text-xs text-slate-400">per {p.unit}</p>
                                                    {p.flavor_option && <p className="text-xs text-indigo-500 italic line-clamp-1 mt-0.5">{p.flavor_option}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3"><SKUBadge sku={p.unique_sku} /></td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-slate-600">{p.category?.category_name || 'Uncategorized'}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-semibold text-slate-900">₱ {formatPrice(p.price)}</p>
                                            {canEdit && <p className="text-xs text-slate-400">Cost: ₱ {formatPrice(p.cost_price)}</p>}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StockBar qty={p.total_stock} max={200} /> {/* Mock max if not computed per branch loop */}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                <StarRating rating={p.average_rating} />
                                                <span className="text-xs text-slate-500 font-medium ml-1">{p.average_rating}</span>
                                                <span className="text-[10px] text-slate-400">({p.reviews?.length || 0})</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <ProductStatusBadge status={p.status} />
                                        </td>
                                        <td className="px-5 py-3 relative">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => navigate(`/products/${p.product_id}`)} className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {canEdit && (
                                                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === p.product_id ? null : p.product_id); }}
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors" 
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                )}
                                                
                                                {openDropdownId === p.product_id && (
                                                    <div className="absolute right-6 top-10 bg-white rounded-xl border border-slate-200 shadow-xl z-50 w-44 py-1" onClick={e=>e.stopPropagation()}>
                                                        <button onClick={() => handleStatusUpdate(p.product_id, 'available')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Mark Available
                                                        </button>
                                                        <button onClick={() => handleStatusUpdate(p.product_id, 'unavailable')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-amber-500" /> Mark Unavailable
                                                        </button>
                                                        <button onClick={() => handleStatusUpdate(p.product_id, 'discontinued')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400" /> Discontinue
                                                        </button>
                                                        {p.status === 'discontinued' && p.total_stock === 0 && (
                                                            <>
                                                                <div className="border-t border-slate-100 my-1" />
                                                                <button onClick={() => handleDelete(p.product_id)} className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 flex items-center gap-2">
                                                                    <XCircle className="w-3.5 h-3.5" /> Delete Product
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((p) => (
                        <div key={p.product_id} className="bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden flex flex-col group">
                            <div className="relative h-44 bg-slate-50 flex items-center justify-center overflow-hidden">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Package className="text-slate-200 w-12 h-12" />
                                )}
                                <div className="absolute top-2 right-2 shadow-sm"><ProductStatusBadge status={p.status} /></div>
                            </div>
                            <div className="p-4 flex-1">
                                <p className="text-sm font-semibold text-slate-900 line-clamp-2 min-h-[40px] leading-tight" title={p.name}>{p.name}</p>
                                <p className="font-mono text-[10px] text-slate-400 mt-1 truncate">{p.unique_sku}</p>
                                <p className="text-xs text-indigo-500 mt-1 font-medium truncate">{p.category?.category_name || 'Uncategorized'}</p>
                                <div className="mt-1.5">
                                    <StarRating rating={p.average_rating} />
                                </div>
                                <div className="mt-2.5 flex items-baseline gap-2 truncate">
                                    <span className="text-base font-bold text-slate-900">₱ {formatPrice(p.price)}</span>
                                    {canEdit && <span className="text-[10px] text-slate-400 tracking-wide">COST ₱ {formatPrice(p.cost_price)}</span>}
                                </div>
                                <div className="mt-2.5">
                                    <StockBar qty={p.total_stock} max={200} />
                                </div>
                            </div>
                            <div className="border-t border-slate-100 p-3 flex gap-2">
                                <button onClick={() => navigate(`/products/${p.product_id}`)} className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors">
                                    View Detail
                                </button>
                                {canEdit && (
                                    <button onClick={() => handleEdit(p)} className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-colors border border-slate-200 hover:border-slate-300">
                                        Quick Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <ProductForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    product={selectedProduct}
                />
            )}
        </div>
    );
};

export default ProductList;
