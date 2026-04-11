import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Store, Building2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomerStore } from '../../store/customerStore';
import useAuthStore from '../../store/authStore';
import CustomerStatusBadge from '../../components/customers/CustomerStatusBadge';
import VerificationBadge from '../../components/customers/VerificationBadge';
import ListingCard from '../../components/customers/ListingCard';
import { formatDate, formatCurrency } from '../../utils/format';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentCustomer, loading, fetchCustomer, verifyCustomer, toggleCustomerStatus } = useCustomerStore();

    useEffect(() => {
        if (id) {
            fetchCustomer(id).catch(err => {
                toast.error(err.response?.data?.message || 'Failed to load customer');
                navigate('/customers');
            });
        }
    }, [id, fetchCustomer, navigate]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading customer...</div>;
    }

    if (!currentCustomer) {
        return <div className="p-8 text-center text-slate-500">Customer not found</div>;
    }

    const handleVerify = async () => {
        try {
            await verifyCustomer(id);
            toast.success('Customer verified successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to verify customer');
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleCustomerStatus(id);
            toast.success('Customer status updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="p-8">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <button onClick={() => navigate('/customers')} className="hover:text-indigo-600">Customers</button>
                <span>/</span>
                <span>{currentCustomer.user?.name}</span>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-2xl flex items-center justify-center flex-shrink-0">
                        {currentCustomer.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900">{currentCustomer.user?.name}</h1>
                        <p className="text-slate-500 mt-0.5">{currentCustomer.user?.email}</p>
                        
                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-3">
                            <CustomerStatusBadge status={currentCustomer.status} />
                            <VerificationBadge isVerified={currentCustomer.is_verified} />
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                📍 {currentCustomer.branch?.name}
                            </span>
                        </div>

                        {/* Store Name */}
                        {currentCustomer.store_name && (
                            <div className="mt-2 flex items-center gap-1.5">
                                <Store className="size-4 text-indigo-500" />
                                <span className="text-indigo-700 font-medium">{currentCustomer.store_name}</span>
                            </div>
                        )}

                        {/* Joined Date */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="size-3" />
                            {formatDate(currentCustomer.joined_at)}
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    {user?.user_type === 'admin' && (
                        <div className="flex flex-col gap-2">
                            {!currentCustomer.is_verified && (
                                <button
                                    onClick={handleVerify}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                                >
                                    ✓ Verify Account
                                </button>
                            )}
                            <button
                                onClick={handleToggleStatus}
                                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                            >
                                {currentCustomer.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Contact Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-slate-500 text-xs">Email</p>
                            <p className="text-slate-900 font-medium">{currentCustomer.user?.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Phone</p>
                            <p className="text-slate-900 font-medium">{currentCustomer.user?.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Address</p>
                            <p className="text-slate-900 font-medium">{currentCustomer.user?.address || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Information</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-slate-500 text-xs">Account Type</p>
                            <p className="text-slate-900 font-medium">Customer / Reseller</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Customer ID</p>
                            <p className="text-slate-900 font-medium">{currentCustomer.customer_id}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Status</p>
                            <CustomerStatusBadge status={currentCustomer.status} />
                        </div>
                    </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-slate-500 text-xs">Member Since</p>
                            <p className="text-slate-900 font-medium">{formatDate(currentCustomer.joined_at)}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Listings</p>
                            <p className="text-slate-900 font-medium">{currentCustomer.listings?.length || 0} products</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Orders</p>
                            <p className="text-slate-900 font-medium">{currentCustomer.orders?.length || 0} total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reseller Listings Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Reseller Listings</h3>
                        <span className="inline-block mt-2 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                            {currentCustomer.listings?.length || 0} products
                        </span>
                    </div>
                </div>

                {currentCustomer.listings && currentCustomer.listings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Product</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Base Price</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Offset</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Listed Price</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Quantity</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {currentCustomer.listings.map(listing => (
                                    <tr key={listing.seller_id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{listing.product?.name}</p>
                                            <p className="text-xs text-slate-400">{listing.product?.unique_sku}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">₱ {formatCurrency(listing.product?.price)}</td>
                                        <td className="px-4 py-3">
                                            <span className={listing.stock_offset >= 0 ? 'text-amber-600' : 'text-red-600'}>
                                                {listing.stock_offset >= 0 ? '+' : ''}₱ {formatCurrency(listing.stock_offset)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-900">₱ {formatCurrency(listing.listed_price)}</td>
                                        <td className="px-4 py-3 text-slate-900">{listing.stock_qty} units</td>
                                        <td className="px-4 py-3">
                                            {listing.is_available ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                                    ✓ Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                                                    ✗ Unavailable
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm">No reseller listings yet</p>
                )}
            </div>

            {/* Order History Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Order History</h3>
                    <button className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">View all</button>
                </div>
                {currentCustomer.orders && currentCustomer.orders.length > 0 ? (
                    <p className="text-sm text-slate-600">{currentCustomer.orders.length} orders on record</p>
                ) : (
                    <p className="text-slate-500 text-sm">No orders yet</p>
                )}
            </div>
        </div>
    );
};

export default CustomerDetail;
