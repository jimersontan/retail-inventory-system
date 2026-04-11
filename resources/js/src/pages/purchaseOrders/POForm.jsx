import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, Calendar, FileText, Package, Plus, Truck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { usePOStore } from '../../store/poStore';
import useAuthStore from '../../store/authStore';

const emptyRow = { product_id: '', quantity_ordered: 1, unit_price: 0 };

const POForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { user } = useAuthStore();
    const { fetchOrder, createOrder, updateOrder, loading } = usePOStore();

    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);

    const [form, setForm] = useState({
        supplier_id: '',
        branch_id: '',
        order_date: new Date().toISOString().slice(0, 10),
        expected_date: '',
        approved_case: '',
        items: [{ ...emptyRow }],
        save_as_draft: true,
    });

    useEffect(() => {
        const loadMeta = async () => {
            const [supplierRes, branchRes, productRes] = await Promise.all([
                api.get('/suppliers'),
                api.get('/branches'),
                api.get('/products'),
            ]);
            setSuppliers(supplierRes.data.data || []);
            setBranches(branchRes.data.data || []);
            setProducts(productRes.data.data || []);
        };

        loadMeta().catch(() => {});
    }, []);

    useEffect(() => {
        if (!isEdit) {
            if (user?.user_type === 'manager' && user?.employee?.branch?.branch_id) {
                setForm((prev) => ({ ...prev, branch_id: user.employee.branch.branch_id }));
            }
            return;
        }

        fetchOrder(id)
            .then((order) => {
                setForm({
                    supplier_id: order.supplier_id || '',
                    branch_id: order.branch_id || '',
                    order_date: order.order_date || '',
                    expected_date: order.expected_date || '',
                    approved_case: order.approved_case || '',
                    items:
                        order.details?.map((detail) => ({
                            po_detail_id: detail.po_detail_id,
                            product_id: detail.product_id,
                            quantity_ordered: detail.quantity_ordered,
                            unit_price: detail.unit_price,
                        })) || [{ ...emptyRow }],
                    save_as_draft: true,
                });
            })
            .catch(() => toast.error('Failed to load purchase order.'));
    }, [isEdit, id, fetchOrder, user]);

    const grandTotal = useMemo(
        () =>
            form.items.reduce((sum, row) => {
                return sum + Number(row.quantity_ordered || 0) * Number(row.unit_price || 0);
            }, 0),
        [form.items]
    );

    const onRowChange = (idx, key, value) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
        }));
    };

    const addRow = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyRow }] }));
    const removeRow = (idx) => {
        setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    const submit = async (e) => {
        e.preventDefault();
        if (form.items.length < 1) {
            toast.error('At least one item is required.');
            return;
        }

        const payload = {
            supplier_id: Number(form.supplier_id),
            branch_id: Number(form.branch_id),
            order_date: form.order_date,
            expected_date: form.expected_date,
            approved_case: form.approved_case === '' ? null : Number(form.approved_case),
            items: form.items.map((row) => ({
                product_id: Number(row.product_id),
                quantity_ordered: Number(row.quantity_ordered),
                unit_price: Number(row.unit_price),
            })),
        };

        try {
            if (isEdit) {
                await updateOrder(Number(id), payload);
                toast.success('Purchase order updated.');
                navigate(`/purchase-orders/${id}`);
                return;
            }

            const created = await createOrder(payload);
            toast.success('Purchase order created.');
            navigate(`/purchase-orders/${created.po_id || created.data?.po_id || ''}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save purchase order.');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-sm text-slate-500">
                <Link to="/purchase-orders" className="hover:text-indigo-600">
                    Purchase Orders
                </Link>{' '}
                <span className="mx-2">/</span>
                <span>{isEdit ? 'Edit Purchase Order' : 'Create New'}</span>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <section className="bg-white rounded-xl border p-6 mb-6">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <FileText className="w-4 h-4 text-indigo-600" /> Order Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="text-sm text-slate-600">
                                Supplier
                                <div className="relative mt-1">
                                    <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select className="w-full pl-9 h-10 border rounded-lg" value={form.supplier_id} onChange={(e) => setForm((p) => ({ ...p, supplier_id: e.target.value }))} required>
                                        <option value="">Select supplier</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.customer_id} value={supplier.customer_id}>
                                                {supplier.store_name || supplier.user?.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </label>

                            {user?.user_type === 'admin' ? (
                                <label className="text-sm text-slate-600">
                                    Branch
                                    <div className="relative mt-1">
                                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select className="w-full pl-9 h-10 border rounded-lg" value={form.branch_id} onChange={(e) => setForm((p) => ({ ...p, branch_id: e.target.value }))} required>
                                            <option value="">Select branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </label>
                            ) : null}

                            <label className="text-sm text-slate-600">
                                Order Date
                                <div className="relative mt-1">
                                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="date" className="w-full pl-9 h-10 border rounded-lg" value={form.order_date} onChange={(e) => setForm((p) => ({ ...p, order_date: e.target.value }))} required />
                                </div>
                            </label>
                            <label className="text-sm text-slate-600">
                                Expected Date
                                <div className="relative mt-1">
                                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="date" className="w-full pl-9 h-10 border rounded-lg" value={form.expected_date} onChange={(e) => setForm((p) => ({ ...p, expected_date: e.target.value }))} required />
                                </div>
                            </label>
                            <label className="text-sm text-slate-600 md:col-span-2">
                                Approved Cases (optional)
                                <input type="number" className="mt-1 w-full h-10 border rounded-lg px-3" placeholder="Number of approved cases" value={form.approved_case} onChange={(e) => setForm((p) => ({ ...p, approved_case: e.target.value }))} />
                            </label>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Package className="w-4 h-4 text-indigo-600" /> Order Items
                            </h3>
                            <button type="button" onClick={addRow} className="px-3 py-2 rounded-lg border border-indigo-200 text-indigo-600 text-sm font-medium flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-slate-500">
                                    <tr>
                                        <th className="text-left py-2">Product</th>
                                        <th className="text-left py-2">Unit Price</th>
                                        <th className="text-left py-2">Qty Ordered</th>
                                        <th className="text-left py-2">Subtotal</th>
                                        <th className="text-left py-2">Remove</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {form.items.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 pr-2">
                                                <select className="w-full h-10 border rounded-lg px-2" value={row.product_id} onChange={(e) => onRowChange(idx, 'product_id', e.target.value)} required>
                                                    <option value="">Select product</option>
                                                    {products.map((product) => (
                                                        <option key={product.product_id} value={product.product_id}>
                                                            {product.name} ({product.unique_sku})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 pr-2">
                                                <div className="flex items-center border rounded-lg px-2">
                                                    <span className="text-slate-400">₱</span>
                                                    <input type="number" step="0.01" min="0" className="w-full h-10 outline-none px-2" value={row.unit_price} onChange={(e) => onRowChange(idx, 'unit_price', e.target.value)} required />
                                                </div>
                                            </td>
                                            <td className="py-2 pr-2">
                                                <input type="number" min="1" className="w-full h-10 border rounded-lg px-2" value={row.quantity_ordered} onChange={(e) => onRowChange(idx, 'quantity_ordered', e.target.value)} required />
                                            </td>
                                            <td className="py-2 pr-2 font-semibold text-indigo-700">
                                                ₱ {(Number(row.unit_price || 0) * Number(row.quantity_ordered || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2">
                                                <button type="button" onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t mt-4 pt-4 flex justify-end">
                            <span className="text-sm text-slate-500">Total Amount:</span>
                            <span className="text-xl font-bold text-indigo-700 ml-4">
                                ₱ {grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-xl border p-5 sticky top-24">
                        <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
                        <div className="space-y-3 divide-y divide-slate-100 text-sm text-slate-600">
                            <div className="pt-0">
                                <p>Supplier</p>
                                <p className="font-medium text-slate-900">{suppliers.find((s) => Number(s.customer_id) === Number(form.supplier_id))?.store_name || '-'}</p>
                            </div>
                            <div className="pt-3">
                                <p>Branch</p>
                                <p className="font-medium text-slate-900">{branches.find((b) => Number(b.branch_id) === Number(form.branch_id))?.name || user?.employee?.branch?.name || '-'}</p>
                            </div>
                            <div className="pt-3">
                                <p>Order Date</p>
                                <p className="font-medium text-slate-900">{form.order_date || '-'}</p>
                            </div>
                            <div className="pt-3">
                                <p>Expected Date</p>
                                <p className="font-medium text-slate-900">{form.expected_date || '-'}</p>
                            </div>
                            <div className="pt-3">
                                <p>Items count</p>
                                <p className="font-medium text-slate-900">{form.items.length}</p>
                            </div>
                            <div className="pt-3">
                                <p>Total Amount</p>
                                <p className="text-2xl font-bold text-indigo-700">
                                    ₱ {grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="mt-5 w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                            {loading ? 'Saving...' : isEdit ? 'Update Purchase Order' : 'Create Purchase Order'}
                        </button>

                        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" checked={form.save_as_draft} onChange={(e) => setForm((p) => ({ ...p, save_as_draft: e.target.checked }))} />
                            Save as draft (submit later)
                        </label>
                    </div>
                </aside>
            </form>
        </div>
    );
};

export default POForm;
