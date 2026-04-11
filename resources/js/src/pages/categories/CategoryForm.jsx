import React, { useState, useEffect } from 'react';
import { FolderPlus, X, Tag, FolderOpen, Loader2, CheckCircle, XCircle, AlertTriangle, CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../store/categoryStore';
import api from '../../api/axios';
import ToggleSwitch from '../../components/ui/ToggleSwitch';

const CategoryForm = ({ isOpen, onClose, category = null }) => {
    const isEdit = Boolean(category);
    const { createCategory, updateCategory, categories } = useCategoryStore();
    
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
        parent_category_id: '',
        is_active: true
    });
    
    const [loading, setLoading] = useState(false);
    const [checkingName, setCheckingName] = useState(false);
    const [nameAvailable, setNameAvailable] = useState(null); // null | true | false
    const [nameTimeout, setNameTimeout] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && category) {
            setFormData({
                category_name: category.category_name || '',
                description: category.description || '',
                parent_category_id: category.parent_category_id || '',
                is_active: Boolean(category.is_active)
            });
            setNameAvailable(true); // Always true for its own name init
        } else if (isOpen) {
            setFormData({
                category_name: '',
                description: '',
                parent_category_id: '',
                is_active: true
            });
            setNameAvailable(null);
        }
        setErrors({});
    }, [isOpen, category]);

    if (!isOpen) return null;

    // Filter categories to only those that can be parents (preventing self or immediate recursive loops though backend checks heavily)
    const validParents = categories.filter(c => c.category_id !== category?.category_id);
    const selectedParent = categories.find(c => c.category_id === Number(formData.parent_category_id));

    const checkNameAvailability = async (name) => {
        if (!name || name === category?.category_name) {
            setCheckingName(false);
            setNameAvailable(name === category?.category_name ? true : null);
            return;
        }
        setCheckingName(true);
        try {
            const res = await api.get(`/categories?check_name=${encodeURIComponent(name)}`);
            setNameAvailable(res.data.available);
        } catch (e) {
            setNameAvailable(null);
        } finally {
            setCheckingName(false);
        }
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, category_name: val });
        setErrors({ ...errors, category_name: null });
        
        if (nameTimeout) clearTimeout(nameTimeout);
        setCheckingName(true);
        
        const timeout = setTimeout(() => {
            checkNameAvailability(val);
        }, 600);
        setNameTimeout(timeout);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.category_name) {
            setErrors({category_name: ['Category name is required']});
            return;
        }
        if (nameAvailable === false) {
            setErrors({category_name: ['This name is already taken']});
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                parent_category_id: formData.parent_category_id || null // Ensure empty string becomes null
            };

            if (isEdit) {
                await updateCategory(category.category_id, payload);
                toast.success('Category updated successfully');
            } else {
                await createCategory(payload);
                toast.success('Category created successfully');
            }
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                toast.error(err.response?.data?.message || 'Submission failed');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate chars for description
    const descCount = formData.description?.length || 0;

    // Guard boolean
    const showWarning = isEdit 
        && category.is_active 
        && !formData.is_active 
        && category.product_count > 0;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <FolderPlus className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                {isEdit ? 'Edit Category' : 'Add Category'}
                            </p>
                            <p className="text-sm text-slate-500">Create a product category</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <Tag className="absolute left-3 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={formData.category_name}
                                onChange={handleNameChange}
                                className={`pl-10 pr-10 h-11 w-full text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                                    errors.category_name ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'
                                }`}
                                placeholder="e.g. Beverages"
                            />
                            {checkingName && <Loader2 className="absolute right-3 text-slate-400 w-4 h-4 animate-spin" />}
                            {!checkingName && nameAvailable === true && formData.category_name && <CheckCircle className="absolute right-3 text-emerald-500 w-4 h-4" />}
                            {!checkingName && nameAvailable === false && <XCircle className="absolute right-3 text-red-500 w-4 h-4" />}
                        </div>
                        {errors.category_name && <p className="text-xs text-red-500 mt-1">{errors.category_name[0]}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Parent Category</label>
                        <div className="relative">
                            <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                                value={formData.parent_category_id}
                                onChange={(e) => setFormData({...formData, parent_category_id: e.target.value})}
                                className="pl-10 h-11 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="">None (Root category)</option>
                                {validParents.map(p => (
                                    <option key={p.category_id} value={p.category_id}>{p.category_name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedParent && (
                            <div className="bg-indigo-50 rounded-lg px-3 py-2 mt-2 flex items-center gap-2">
                                <CornerDownRight className="text-indigo-400 w-3 h-3" />
                                <span className="text-sm text-indigo-700">Will appear under: {selectedParent.category_name}</span>
                            </div>
                        )}
                        {errors.parent_category_id && <p className="text-xs text-red-500 mt-1">{errors.parent_category_id[0]}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                        <textarea
                            rows={3}
                            maxLength={500}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Optional category description..."
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-xs text-slate-400">{descCount} / 500</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Active Status</p>
                                <p className="text-xs text-slate-400">Visible in product catalog</p>
                            </div>
                            <ToggleSwitch 
                                checked={formData.is_active} 
                                onChange={(val) => setFormData({...formData, is_active: val})} 
                            />
                        </div>
                        
                        {showWarning && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 flex items-start gap-2">
                                <AlertTriangle className="text-amber-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-700 text-sm">
                                    This category has {category.product_count} active products. Deactivating may affect product visibility.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || nameAvailable === false}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Update Category' : 'Save Category'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CategoryForm;
