import React, { useState, useEffect, useRef } from 'react';
import { PackagePlus, X, Package, Tag, Ruler, ShoppingBag, DollarSign, Info, Barcode, Lock, CheckCircle, PauseCircle, XCircle, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import useBranchScope from '../../hooks/useBranchScope';

const UNITS = ["pcs","kg","box","pack","bottle","liter","can","sachet"];

const ProductForm = ({ isOpen, onClose, product = null }) => {
    const isEdit = Boolean(product);
    const { isAdmin, isManager } = useBranchScope();
    const canViewCost = isAdmin || isManager;
    const fileInputRef = useRef(null);

    const { createProduct, updateProduct } = useProductStore();
    const { categories } = useCategoryStore();

    const [formData, setFormData] = useState({
        name: '',
        flavor_option: '',
        category_id: '',
        supplier_id: '',
        unit: 'pcs',
        price: '',
        cost_price: '',
        status: 'available'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && product) {
            setFormData({
                name: product.name || '',
                flavor_option: product.flavor_option || '',
                category_id: product.category_id || '',
                supplier_id: product.supplier_id || '',
                unit: product.unit || '',
                price: product.price || '',
                cost_price: product.cost_price || '',
                status: product.status || 'available'
            });
            setImagePreview(product.image_url || null);
        } else if (isOpen) {
             setFormData({
                name: '', flavor_option: '', category_id: '', supplier_id: '',
                unit: 'pcs', price: '', cost_price: '', status: 'available'
            });
            setImageFile(null);
            setImagePreview(null);
        }
        setErrors({});
    }, [isOpen, product]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size must be less than 2MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    const flatCategories = categories.reduce((acc, cat) => {
        acc.push(cat);
        if (cat.children) {
            cat.children.forEach(sub => acc.push({...sub, isSub: true}));
        }
        return acc;
    }, []);

    const selectedCat = flatCategories.find(c => c.category_id === Number(formData.category_id));
    const catInitials = selectedCat ? selectedCat.category_name.substring(0, 3).toUpperCase() : 'XXX';

    const pPrice = Number(formData.price) || 0;
    const cPrice = Number(formData.cost_price) || 0;
    const margin = pPrice - cPrice;
    const marginPct = (cPrice > 0 && pPrice > 0) ? ((margin / cPrice) * 100).toFixed(1) : 0;
    
    let marginClass = 'text-slate-600 bg-slate-50';
    if (cPrice > 0) {
        if (marginPct > 30) marginClass = 'text-emerald-600 bg-emerald-50';
        else if (marginPct >= 10) marginClass = 'text-amber-600 bg-amber-50';
        else marginClass = 'text-red-600 bg-red-50';
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '' && formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (isEdit) {
                // Laravel SPOOFING for PUT since FormData doesn't work with true PUT in PHP easily
                data.append('_method', 'PUT');
                await updateProduct(product.product_id, data);
                toast.success('Product updated');
            } else {
                await createProduct(data);
                toast.success('Product created');
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

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative my-auto">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <PackagePlus className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                {isEdit ? 'Edit Product' : 'Add Product'}
                            </p>
                            <p className="text-sm text-slate-500">Fill in the product information below</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    
                    {/* Image Upload Selection Section */}
                    <div className="mb-6">
                        <label className="text-sm font-semibold text-slate-700 block mb-3">Product Image (HD)</label>
                        <div className="flex gap-4 items-start">
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className={`w-36 h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                                    imagePreview ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                                }`}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload className="text-white w-6 h-6" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="text-slate-300 w-8 h-8 mb-2 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-indigo-500">Upload Image</span>
                                    </>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        <span className="text-indigo-600 font-bold block mb-1">IMAGE TIPS:</span>
                                        Use high-resolution square images (1000x1000px) with a clean background for the best "HD" display in your shop and POS.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    {imagePreview ? 'Change Image' : 'Select Image File'}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                />
                                {errors.image && <p className="text-xs text-red-500 font-medium px-1 capitalize">{errors.image[0]}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-slate-50 rounded-xl p-5 space-y-4 mb-5 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingBag className="text-indigo-600 w-4 h-4" />
                            <span className="text-sm font-semibold text-slate-700">Basic Information</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 block mb-1">Product Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Product name"
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                        className={`pl-10 h-11 w-full text-sm border rounded-lg focus:ring-2 outline-none ${errors.name ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'}`}
                                    />
                                </div>
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Category <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <select
                                        value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                                        className={`pl-10 h-11 w-full text-sm border rounded-lg focus:ring-2 outline-none bg-white ${errors.category_id ? 'border-red-300' : 'border-slate-200'}`}
                                    >
                                        <option value="">Select category...</option>
                                        {flatCategories.map(c => (
                                            <option key={c.category_id} value={c.category_id}>{c.isSub ? `— ${c.category_name}` : c.category_name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id[0]}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Unit / Measure <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" placeholder="e.g. pcs, kg, box, bottle"
                                        value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                                        className={`pl-10 h-11 w-full text-sm border rounded-lg focus:ring-2 outline-none ${errors.unit ? 'border-red-300' : 'border-slate-200'}`}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {UNITS.map(u => (
                                        <span 
                                            key={u} onClick={() => setFormData({...formData, unit: u})}
                                            className="text-[10px] font-medium bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-full px-2.5 py-1 cursor-pointer transition-colors"
                                        >
                                            {u}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 block mb-2">Item Status <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'available'})}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.status === 'available' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <CheckCircle className={`w-4 h-4 ${formData.status === 'available' ? 'text-emerald-500' : 'text-slate-400'}`} /> Available
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'unavailable'})}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.status === 'unavailable' ? 'border-amber-500 bg-amber-50 text-amber-800 font-semibold' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <PauseCircle className={`w-4 h-4 ${formData.status === 'unavailable' ? 'text-amber-500' : 'text-slate-400'}`} /> Unavailable
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'discontinued'})}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.status === 'discontinued' ? 'border-red-400 bg-red-50 text-red-800 font-semibold' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <XCircle className={`w-4 h-4 ${formData.status === 'discontinued' ? 'text-red-500' : 'text-slate-400'}`} /> Discontinue
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 block mb-1">Flavor / Variant <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span></label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Chocolate, Vanilla, Strawberry"
                                    value={formData.flavor_option} onChange={e => setFormData({...formData, flavor_option: e.target.value})}
                                    className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* SKU Generator Preview */}
                            <div className="col-span-1 md:col-span-2">
                                {isEdit ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Barcode className="text-slate-300 w-8 h-8" />
                                            <div>
                                                <p className="font-mono text-lg font-bold text-slate-600">{product.unique_sku}</p>
                                                <p className="text-xs text-slate-400"><Lock className="w-3 h-3 inline mr-1" /> SKU cannot be changed</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4">
                                        <Barcode className="text-indigo-400 w-8 h-8 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Auto-Generated SKU</p>
                                            <p className="text-lg font-mono font-bold text-indigo-800 mt-0.5">RIS-{catInitials}-XXXXXXXX</p>
                                            <p className="text-xs text-indigo-400 mt-0.5">Generated automatically when saved using category initials</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="text-indigo-600 w-4 h-4" />
                            <span className="text-sm font-semibold text-slate-700">Pricing Configuration</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Selling Price <span className="text-red-500">*</span></label>
                                <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
                                    <span className="px-3 bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-medium border-r border-slate-200">₱</span>
                                    <input 
                                        type="number" step="0.01" min="0" placeholder="0.00"
                                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                        className="flex-1 px-3 h-11 text-sm bg-white outline-none"
                                    />
                                </div>
                                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price[0]}</p>}
                            </div>

                            {canViewCost && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Cost Price <span className="text-red-500">*</span></label>
                                    <div className="flex rounded-lg overflow-hidden border border-amber-200 focus-within:ring-2 focus-within:ring-amber-300 bg-amber-50">
                                        <span className="px-3 bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-medium border-r border-amber-200">₱</span>
                                        <input 
                                            type="number" step="0.01" min="0" placeholder="0.00"
                                            value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})}
                                            className="flex-1 px-3 h-11 text-sm bg-transparent outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <Info className="text-amber-500 w-3 h-3" />
                                        <span className="text-xs text-amber-600">Only visible to admin and managers</span>
                                    </div>
                                    {cPrice > 0 && pPrice > 0 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-slate-500 font-medium">Margin:</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full tracking-wide ${marginClass}`}>
                                                ₱ {margin.toFixed(2)} ({marginPct}%)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isEdit && (
                                <div className="col-span-1 md:col-span-2 mt-2">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                                        <Info className="text-blue-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-700">
                                            Inventory will be automatically created for all active branches with <strong>0 initial stock</strong> when this product is saved.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0">
                    <button onClick={onClose} disabled={loading} className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Update Product' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
