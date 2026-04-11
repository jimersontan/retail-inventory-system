import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useListingStore } from '../../store/listingStore';
import { formatCurrency } from '../../utils/format';

const ListingModal = ({ isOpen, onClose, editingListing, onSuccess }) => {
    const { saveListing } = useListingStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        stock_offset: 0,
        stock_qty: 0,
        is_available: true,
    });

    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (editingListing) {
            setFormData({
                product_id: editingListing.product_id,
                stock_offset: parseFloat(editingListing.stock_offset),
                stock_qty: editingListing.stock_qty,
                is_available: editingListing.is_available,
            });
            setSelectedProduct(editingListing.product);
        } else {
            setFormData({
                product_id: '',
                stock_offset: 0,
                stock_qty: 0,
                is_available: true,
            });
            setSelectedProduct(null);
        }
    }, [editingListing, isOpen]);

    useEffect(() => {
        // Fetch products (stub - replace with actual API call)
        setProducts([
            { product_id: 1, name: 'Product A', price: 100, unique_sku: 'SKU-001' },
            { product_id: 2, name: 'Product B', price: 200, unique_sku: 'SKU-002' },
            { product_id: 3, name: 'Product C', price: 300, unique_sku: 'SKU-003' },
        ]);
    }, []);

    const handleProductChange = (e) => {
        const productId = parseInt(e.target.value);
        const product = products.find(p => p.product_id === productId);
        setSelectedProduct(product);
        setFormData(prev => ({ ...prev, product_id: productId }));
    };

    const listedPrice = selectedProduct ? selectedProduct.price + parseFloat(formData.stock_offset) : 0;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await saveListing({
                ...formData,
                ...(editingListing && { seller_id: editingListing.seller_id }),
            });
            toast.success(editingListing ? 'Listing updated' : 'Listing created');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save listing');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="size-5 text-slate-900" />
                        <h2 className="text-lg font-semibold text-slate-900">
                            {editingListing ? 'Edit Listing' : 'List a Product'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Product Select (if creating) */}
                    {!editingListing && (
                        <div>
                            <label className="text-xs font-medium text-slate-600">Select Product</label>
                            <select
                                value={formData.product_id}
                                onChange={handleProductChange}
                                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Choose a product...</option>
                                {products.map(p => (
                                    <option key={p.product_id} value={p.product_id}>
                                        {p.name} - ₱{formatCurrency(p.price)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedProduct && (
                        <>
                            {/* Base Price Display */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Base Price</p>
                                <p className="text-sm font-semibold text-slate-900">₱ {formatCurrency(selectedProduct.price)}</p>
                            </div>

                            {/* Price Offset */}
                            <div>
                                <label className="text-xs font-medium text-slate-600">Price Offset (+ or -)</label>
                                <div className="mt-1 flex items-center">
                                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-l-lg">₱</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.stock_offset}
                                        onChange={(e) => setFormData({...formData, stock_offset: parseFloat(e.target.value) || 0})}
                                        className="flex-1 px-3 py-2 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-r-lg"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Amount added to base price</p>
                            </div>

                            {/* Listed Price Display */}
                            <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-200">
                                <p className="text-xs text-indigo-600 mb-1">Your Listed Price</p>
                                <p className="text-2xl font-bold text-indigo-700">₱ {formatCurrency(listedPrice)}</p>
                            </div>

                            {/* Stock Quantity */}
                            <div>
                                <label className="text-xs font-medium text-slate-600">Stock Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock_qty}
                                    onChange={(e) => setFormData({...formData, stock_qty: parseInt(e.target.value) || 0})}
                                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0"
                                />
                                <p className="text-xs text-slate-400 mt-1">Your stock quantity for this product</p>
                            </div>

                            {/* Available Toggle */}
                            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <label className="text-xs font-medium text-slate-600">Available for Sale</label>
                                <button
                                    onClick={() => setFormData({...formData, is_available: !formData.is_available})}
                                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${formData.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.is_available ? 'translate-x-5' : 'translate-x-0.5'}`}
                                    />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedProduct || loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors font-medium text-sm"
                    >
                        {loading ? 'Saving...' : editingListing ? 'Update Listing' : 'Save Listing'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingModal;
