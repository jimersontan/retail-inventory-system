import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter, LayoutGrid, LayoutList, CheckCircle2, AlertCircle, Bookmark, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import ProductStatusBadge from '../../components/products/ProductStatusBadge';
import SKUBadge from '../../components/products/SKUBadge';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const ShopPage = () => {
    const navigate = useNavigate();
    const { products, pagination, loading, viewMode, setViewMode, fetchProducts } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const params = { 
            page: pagination.currentPage,
            status: 'available' // Only show available products to customers
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (categoryId) params.category_id = categoryId;
        
        fetchProducts(params);
    }, [debouncedSearch, categoryId, pagination.currentPage]);

    const formatPrice = (p) => Number(p || 0).toLocaleString('en-PH', {minimumFractionDigits: 2});

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Catalog</h1>
                    </div>
                    <p className="text-slate-500 text-lg">Browse and discover our latest products curated just for you.</p>
                </div>
                
                <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="List View"
                    >
                        <LayoutList className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find products by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 h-12 w-full text-base border-0 bg-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-56">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            <select
                                className="pl-10 pr-4 h-12 w-full text-sm bg-slate-50 border-0 rounded-xl focus:ring-2 focus:outline-none appearance-none cursor-pointer"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <div className="inline-block animate-spin w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 mb-4" />
                    <p className="text-slate-500 font-medium">Loading catalog...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No products available</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any products matching your search criteria at the moment.</p>
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Rating</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((p) => (
                                    <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden border border-slate-100 shadow-sm">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShoppingBag className="text-slate-400 w-6 h-6" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <SKUBadge sku={p.unique_sku} />
                                                        <span className="text-xs text-slate-400 font-medium">per {p.unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {p.category?.category_name || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <p className="text-lg font-extrabold text-slate-900">₱ {formatPrice(p.price)}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-bold text-slate-700">{p.average_rating}</span>
                                                <span className="text-xs text-slate-400">({p.reviews?.length || 0})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button 
                                                onClick={() => navigate(`/products/${p.product_id}`)}
                                                className="w-full max-w-[120px] mx-auto bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <div 
                            key={p.product_id} 
                            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden group cursor-pointer"
                            onClick={() => navigate(`/products/${p.product_id}`)}
                        >
                            <div className="relative h-56 bg-white flex items-center justify-center group-hover:bg-slate-50 transition-colors overflow-hidden border-b border-slate-100">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <ShoppingBag className="text-slate-200 w-16 h-16 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute top-4 left-4 shadow-md">
                                    <SKUBadge sku={p.unique_sku} />
                                </div>
                                <div className="absolute bottom-4 right-4 bg-indigo-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-white border border-indigo-400/30 shadow-lg tracking-wider">
                                    {p.unit.toUpperCase()}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                                        {p.category?.category_name || 'General'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] font-bold text-slate-700">{p.average_rating}</span>
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">{p.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed min-h-[32px]">{p.flavor_option || 'No detailed description available for this product.'}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Price</p>
                                        <p className="text-xl font-extrabold text-slate-900">₱ {formatPrice(p.price)}</p>
                                    </div>
                                    <button 
                                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform active:scale-95 shadow-sm"
                                        title="View Details"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopPage;
