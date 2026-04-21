import React, { useEffect, useState } from 'react';
import { UserPlus, Users, UserCheck, Clock, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCustomerStore } from '../../store/customerStore';
import useAuthStore from '../../store/authStore';
import CustomerStatusBadge from '../../components/customers/CustomerStatusBadge';
import VerificationBadge from '../../components/customers/VerificationBadge';
import { formatAsLabel, formatRelativeDate } from '../../utils/format';

const CustomerList = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { customers, loading, fetchCustomers, pagination, verifyCustomer, toggleCustomerStatus } = useCustomerStore();
    
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        verified: 'all',
        branch_id: 'all',
    });

    useEffect(() => {
        const params = {
            ...(filters.search && { search: filters.search }),
            ...(filters.status !== 'all' && { status: filters.status }),
            ...(filters.verified !== 'all' && { verified: filters.verified === 'true' }),
            ...(filters.branch_id !== 'all' && user?.user_type === 'admin' && { branch_id: filters.branch_id }),
        };
        
        fetchCustomers(params).catch(err => {
            toast.error(err.response?.data?.message || 'Failed to load customers');
        });
    }, [filters, fetchCustomers]);

    // Calculate stats
    const stats = [
        { label: 'Total Customers', icon: Users, value: pagination.total, color: 'indigo' },
        { label: 'Active', icon: UserCheck, value: customers.filter(c => c.status === 'active').length, color: 'emerald' },
        { label: 'Pending Verification', icon: Clock, value: customers.filter(c => c.status === 'pending_verification').length, color: 'amber' },
        { label: 'Inactive', icon: UserX, value: customers.filter(c => c.status === 'inactive').length, color: 'red' },
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage registered customers and resellers</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const colorMap = {
                        indigo: 'text-indigo-500',
                        emerald: 'text-emerald-500',
                        amber: 'text-amber-500',
                        red: 'text-red-500',
                    };
                    
                    return (
                        <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                </div>
                                <Icon className={`size-5 ${colorMap[stat.color]}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex gap-3 flex-wrap items-center">
                <input
                    type="text"
                    placeholder="Search name, email, or store..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48"
                />
                
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending_verification">Pending</option>
                    <option value="inactive">Inactive</option>
                </select>

                <select
                    value={filters.verified}
                    onChange={(e) => handleFilterChange('verified', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
                >
                    <option value="all">All Verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                </select>

                {user?.user_type === 'admin' && (
                    <select
                        value={filters.branch_id}
                        onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
                    >
                        <option value="all">All Branches</option>
                        <option value="1">Branch 1</option>
                        <option value="2">Branch 2</option>
                    </select>
                )}

                <span className="ml-auto text-sm text-slate-500 font-medium">
                    {pagination.total} results
                </span>
            </div>

            {/* Customer Table */}
            {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                    Loading customers...
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                    No customers found
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Customer / Store</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Phone Number</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Verified</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {customers.map((customer) => {
                                const initials = customer.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C';
                                
                                return (
                                    <tr key={customer.customer_id} className="hover:bg-slate-50 transition-colors">
                                        {/* Customer & Store Cell */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{customer.user?.name}</p>
                                                    <p className="text-xs text-slate-400">{customer.user?.email}</p>
                                                    {customer.store_name && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                                                            <span>🏪</span> {customer.store_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Address Cell */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 line-clamp-2">
                                                {customer.user?.address || <span className="text-slate-300">—</span>}
                                            </p>
                                        </td>
                                        
                                        {/* Phone Number Cell */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">
                                                {customer.user?.phone || <span className="text-slate-300">—</span>}
                                            </p>
                                        </td>
                                        
                                        {/* Status Badge */}
                                        <td className="px-6 py-4">
                                            <CustomerStatusBadge status={customer.status} />
                                        </td>
                                        
                                        {/* Verified Badge */}
                                        <td className="px-6 py-4">
                                            <VerificationBadge isVerified={customer.is_verified} />
                                        </td>
                                        
                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/customers/${customer.customer_id}`)}
                                                    className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-700 transition-colors"
                                                    title="View"
                                                >
                                                    👁️
                                                </button>
                                                
                                                {user?.user_type === 'admin' && !customer.is_verified && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Verifying this customer will activate their account. Are you sure?')) {
                                                                try {
                                                                    await verifyCustomer(customer.customer_id);
                                                                    toast.success('Customer verified successfully');
                                                                } catch (err) {
                                                                    toast.error('Failed to verify customer');
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 transition-colors"
                                                        title="Verify Customer"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                
                                                {user?.user_type === 'admin' && (
                                                    <button
                                                        onClick={async () => {
                                                            const action = customer.status === 'active' ? 'deactivate' : 'activate';
                                                            if (window.confirm(`Are you sure you want to ${action} this customer?`)) {
                                                                try {
                                                                    await toggleCustomerStatus(customer.customer_id);
                                                                    toast.success(`Customer ${action}d successfully`);
                                                                } catch (err) {
                                                                    toast.error(`Failed to ${action} customer`);
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                                        title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {customer.status === 'active' ? '🚫' : '✅'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
