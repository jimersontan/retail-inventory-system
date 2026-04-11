import React, { useState, useEffect } from 'react';
import {
    X,
    SlidersHorizontal,
    Plus,
    Trash2,
    AlertTriangle,
    Loader,
    ArrowDownToLine,
    ArrowUpFromLine,
    Building2,
    Calendar,
    Hammer,
    ShieldAlert,
    ClipboardCheck,
    ArrowLeftRight,
    Clock,
    MoreHorizontal,
} from 'lucide-react';
import useAdjustmentStore from '../../store/adjustmentStore';
import toast from 'react-hot-toast';

const REASONS = [
    { value: 'damaged', label: 'Damaged', icon: Hammer },
    { value: 'theft', label: 'Theft', icon: ShieldAlert },
    { value: 'count_correction', label: 'Count Correction', icon: ClipboardCheck },
    { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { value: 'expired', label: 'Expired', icon: Clock },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const NewAdjustmentModal = ({ isOpen, onClose, userRole, userBranchId, branches = [] }) => {
    const { createAdjustment } = useAdjustmentStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [formData, setFormData] = useState({
        branch_id: userRole === 'manager' ? userBranchId : '',
        reason: '',
        notes: '',
        items: [
            {
                id: Math.random(),
                inventory_id: '',
                product_id: '',
                product_name: '',
                current_qty: 0,
                type: 'in',
                quantity: 1,
                notes: '',
            },
        ],
    });

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data.data || []);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    // Fetch inventory for selected products to get current stock
    const fetchInventoryData = async () => {
        try {
            const response = await fetch('/api/inventory');
            const data = await response.json();
            
            // Create a map of inventory by product_id
            const inventoryMap = {};
            data.data?.forEach((inv) => {
                if (!inventoryMap[inv.product_id]) {
                    inventoryMap[inv.product_id] = [];
                }
                inventoryMap[inv.product_id].push(inv);
            });
            
            return inventoryMap;
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            return {};
        }
    };

    const handleProductChange = async (itemId, productId) => {
        const selectedProduct = products.find((p) => p.product_id === parseInt(productId));

        if (!selectedProduct) return;

        // Fetch inventory to get current quantity
        const inventoryMap = await fetchInventoryData();
        const invList = inventoryMap[productId] || [];
        
        // Get inventory for the selected branch
        let selectedInv = invList.find((inv) => inv.branch_id === parseInt(formData.branch_id));
        if (!selectedInv && invList.length > 0) {
            selectedInv = invList[0]; // Fallback to first if not in branch
        }

        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          inventory_id: selectedInv?.inventory_id || '',
                          product_id: productId,
                          product_name: selectedProduct.name,
                          current_qty: selectedInv?.quantity || 0,
                      }
                    : item
            ),
        }));
    };

    const handleTypeChange = (itemId, type) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId ? { ...item, type } : item
            ),
        }));
    };

    const handleQuantityChange = (itemId, quantity) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId ? { ...item, quantity: Math.max(1, parseInt(quantity) || 0) } : item
            ),
        }));
    };

    const handleNotesChange = (itemId, notes) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId ? { ...item, notes } : item
            ),
        }));
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    id: Math.random(),
                    inventory_id: '',
                    product_id: '',
                    product_name: '',
                    current_qty: 0,
                    type: 'in',
                    quantity: 1,
                    notes: '',
                },
            ],
        }));
    };

    const removeItem = (itemId) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    };

    // Validation
    const hasErrors = formData.items.some((item) => {
        if (item.type === 'out' && item.quantity > item.current_qty) {
            return true;
        }
        return false;
    });

    const isFormValid =
        !formData.branch_id ||
        !formData.reason ||
        formData.items.length === 0 ||
        formData.items.some((item) => !item.inventory_id) ||
        hasErrors;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isFormValid) {
            toast.error('Please fill all required fields and fix validation errors');
            return;
        }

        setIsSubmitting(true);
        try {
            await createAdjustment({
                branch_id: parseInt(formData.branch_id),
                reason: formData.reason,
                notes: formData.notes,
                items: formData.items.map((item) => ({
                    inventory_id: parseInt(item.inventory_id),
                    type: item.type,
                    quantity: item.quantity,
                    notes: item.notes,
                })),
            });

            // Reset form
            setFormData({
                branch_id: userRole === 'manager' ? userBranchId : '',
                reason: '',
                notes: '',
                items: [
                    {
                        id: Math.random(),
                        inventory_id: '',
                        product_id: '',
                        product_name: '',
                        current_qty: 0,
                        type: 'in',
                        quantity: 1,
                        notes: '',
                    },
                ],
            });

            onClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 px-6 py-5 border-b border-slate-200 bg-white flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <SlidersHorizontal className="size-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">New Stock Adjustment</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Correct inventory with a documented reason
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                    >
                        <X className="size-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5">
                    {/* Branch + Date Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Branch Select (admin only, or pre-filled for manager) */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-2 block">
                                Branch *
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <select
                                    value={formData.branch_id}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            branch_id: e.target.value,
                                        }))
                                    }
                                    disabled={userRole === 'manager'}
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm disabled:bg-slate-100"
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch.branch_id} value={branch.branch_id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Adjustment Date */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-2 block">
                                Adjustment Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={today}
                                    disabled
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reason Selection */}
                    <div className="mb-5">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Adjustment Reason *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {REASONS.map((reason) => {
                                const IconComponent = reason.icon;
                                return (
                                    <button
                                        key={reason.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                reason: reason.value,
                                            }))
                                        }
                                        className={`border-2 rounded-xl p-3 text-center cursor-pointer transition-all ${
                                            formData.reason === reason.value
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <IconComponent className="w-6 h-6 mx-auto mb-1" />
                                        <p className="text-xs font-medium text-slate-900">
                                            {reason.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-slate-900">Products to Adjust</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center gap-1 transition-colors"
                            >
                                <Plus className="size-3" />
                                Add Product
                            </button>
                        </div>

                        {/* Adjustment Items */}
                        <div className="space-y-3">
                            {formData.items.map((item, index) => {
                                const newBalance =
                                    item.type === 'in'
                                        ? item.current_qty + item.quantity
                                        : item.current_qty - item.quantity;
                                const exceedsStock = item.type === 'out' && item.quantity > item.current_qty;

                                return (
                                    <div key={item.id} className="bg-slate-50 rounded-xl p-4">
                                        <div className="grid grid-cols-12 gap-3 items-start mb-2">
                                            {/* Product Select */}
                                            <div className="col-span-4">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) =>
                                                        handleProductChange(item.id, e.target.value)
                                                    }
                                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map((product) => (
                                                        <option
                                                            key={product.product_id}
                                                            value={product.product_id}
                                                        >
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {item.current_qty !== null && item.product_id && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Current: {item.current_qty} units
                                                    </p>
                                                )}
                                            </div>

                                            {/* Type Toggle */}
                                            <div className="col-span-2 flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTypeChange(item.id, 'in')}
                                                    className={`flex-1 border rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                                        item.type === 'in'
                                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                                            : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                                                    }`}
                                                >
                                                    <ArrowDownToLine className="size-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTypeChange(item.id, 'out')}
                                                    className={`flex-1 border rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                                        item.type === 'out'
                                                            ? 'bg-red-600 text-white border-red-600'
                                                            : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                                                    }`}
                                                >
                                                    <ArrowUpFromLine className="size-3" />
                                                </button>
                                            </div>

                                            {/* Quantity Input */}
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleQuantityChange(item.id, e.target.value)
                                                    }
                                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                                />
                                            </div>

                                            {/* Notes Input */}
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="Line note..."
                                                    value={item.notes}
                                                    onChange={(e) =>
                                                        handleNotesChange(item.id, e.target.value)
                                                    }
                                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                                />
                                            </div>

                                            {/* Remove Button */}
                                            <div className="col-span-1 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    disabled={formData.items.length === 1}
                                                >
                                                    <X className="size-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        <div className="text-xs mt-2 flex items-center gap-2">
                                            {exceedsStock ? (
                                                <div className="text-red-600 font-medium flex items-center gap-1">
                                                    <AlertTriangle className="size-3" />
                                                    ⚠ Exceeds current stock
                                                </div>
                                            ) : item.product_id ? (
                                                <div
                                                    className={
                                                        item.type === 'in'
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    Will become: <span className="font-medium">{newBalance}</span>{' '}
                                                    units
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Global Notes */}
                    <div className="mt-4 mb-4">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            General Notes (Optional)
                        </label>
                        <textarea
                            rows="2"
                            placeholder="Reason for this batch adjustment..."
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none"
                        />
                    </div>

                    {/* Body Footer Summary + Warnings */}
                    <div className="border-t pt-4 mb-4">
                        <p className="text-sm text-slate-500 mb-2">
                            {formData.items.length} product{formData.items.length !== 1 ? 's' : ''} to
                            adjust
                        </p>

                        {hasErrors && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                <AlertTriangle className="size-4 text-red-500 flex-shrink-0" />
                                <p className="text-red-700 text-sm">
                                    Some quantities exceed current stock levels
                                </p>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isFormValid || isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="size-4 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            'Apply Adjustments'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewAdjustmentModal;
