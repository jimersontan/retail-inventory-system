import React, { useEffect, useState } from 'react';
import { FolderPlus, Tag, Package, FolderOpen, CornerDownRight, Search, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../store/categoryStore';
import useBranchScope from '../../hooks/useBranchScope';
import CategoryForm from './CategoryForm';

// Re-using the branch badge logic or simple span
const CategoryStatusBadge = ({ isActive }) => (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1.5 border w-fit ${
        isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
    </span>
);

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const CategoryList = () => {
    const { isAdmin, isManager } = useBranchScope();
    const canEdit = isAdmin || isManager;
    
    const { categories, fetchCategories, toggleCategoryStatus, loading } = useCategoryStore();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedIds, setExpandedIds] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== 'all') params.is_active = statusFilter;
        fetchCategories(params);
    }, [debouncedSearch, statusFilter]);

    const handleCreate = () => {
        setSelectedCategory(null);
        fetchCategories().catch(() => {});
        setIsFormOpen(true);
    };

    const handleEdit = (e, cat) => {
        e.stopPropagation();
        setSelectedCategory(cat);
        fetchCategories().catch(() => {});
        setIsFormOpen(true);
    };

    const handleToggle = async (e, id) => {
        e.stopPropagation();
        try {
            await toggleCategoryStatus(id);
            toast.success('Category status updated');
        } catch (err) {}
    };

    const toggleAccordion = (id) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Category Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Organize products into categories</p>
                </div>
                {canEdit && (
                    <button
                        onClick={handleCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <FolderPlus className="w-4 h-4" /> Add Category
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[12rem] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <select
                    className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                            <div className="flex justify-between">
                                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                                <div className="w-16 h-6 bg-slate-200 rounded-full" />
                            </div>
                            <div className="h-5 bg-slate-200 rounded mt-4 w-3/4" />
                            <div className="h-4 bg-slate-100 rounded mt-2 w-1/2" />
                            <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between">
                                <div className="h-4 bg-slate-200 w-16" />
                                <div className="h-4 bg-slate-200 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <Tag className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-500 font-medium mt-3 text-sm">No categories yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => {
                        const isExpanded = expandedIds.includes(cat.category_id);
                        return (
                            <div 
                                key={cat.category_id} 
                                onClick={() => cat.children?.length > 0 && toggleAccordion(cat.category_id)}
                                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <Tag className="text-indigo-500 w-5 h-5" />
                                    </div>
                                    <CategoryStatusBadge isActive={cat.is_active} />
                                </div>

                                <div className="mt-3 flex-1">
                                    <p className="text-base font-semibold text-slate-900">{cat.category_name}</p>
                                    
                                    {cat.parent ? (
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                            <CornerDownRight className="w-3 h-3" />
                                            Sub-category of {cat.parent.category_name}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-indigo-400 font-medium mt-0.5 inline-block">Root Category</span>
                                    )}

                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">
                                        {cat.description || <span className="italic text-slate-300">No description</span>}
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center text-xs text-slate-500" title="Available Products">
                                            <Package className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                                            {cat.product_count || 0}
                                        </div>
                                        <div className="flex items-center text-xs text-slate-500" title="Sub-categories">
                                            <FolderOpen className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                                            {cat.sub_category_count || 0}
                                        </div>
                                    </div>
                                    
                                    {canEdit && (
                                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={(e) => handleEdit(e, cat)}
                                                className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleToggle(e, cat.category_id)}
                                                className={`p-1.5 rounded-md transition-colors ${
                                                    cat.is_active 
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {cat.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Accordion Subcategories */}
                                {isExpanded && cat.children?.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.children.map(sub => (
                                                <span 
                                                    key={sub.category_id}
                                                    onClick={() => { setSelectedCategory(sub); setIsFormOpen(true); }}
                                                    className="bg-indigo-50 text-indigo-600 rounded-full px-3 py-1 text-xs font-medium hover:bg-indigo-100 cursor-pointer transition-colors"
                                                >
                                                    {sub.category_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isFormOpen && (
                <CategoryForm 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    category={selectedCategory} 
                />
            )}
        </div>
    );
};

export default CategoryList;
