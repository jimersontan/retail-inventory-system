import React, { useState, useEffect } from 'react';
import {
    SlidersHorizontal,
    ClipboardList,
    CalendarCheck,
    ArrowDownToLine,
    ArrowUpFromLine,
    Search,
    Filter,
    Package,
    Building2,
    ChevronLeft,
    ChevronRight,
    Loader,
} from 'lucide-react';
import useAdjustmentStore from '../../store/adjustmentStore';
import NewAdjustmentModal from './NewAdjustmentModal';
import ReasonBadge from '../../components/adjustments/ReasonBadge';
import QtyChangeBadge from '../../components/adjustments/QtyChangeBadge';
import toast from 'react-hot-toast';

const AdjustmentList = ({ userRole = 'admin', userBranchId = null }) => {
    const { adjustments, stats, loading, pagination, fetchAdjustments } = useAdjustmentStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(false);

    const [filters, setFilters] = useState({
        branch_id: '',
        reason: '',
        type: '',
        date_from: '',
        date_to: '',
        moved_by: '',
        search: '',
    });

    // Fetch branches for filter
    useEffect(() => {
        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                const response = await fetch('/api/branches');
                const data = await response.json();
                setBranches(data.data || []);
            } catch (error) {
                console.error('Failed to fetch branches:', error);
            } finally {
                setLoadingBranches(false);
            }
        };

        fetchBranches();
    }, []);

    // Fetch adjustments on mount and when filters change
    useEffect(() => {
        fetchAdjustments({
            branch_id: filters.branch_id || undefined,
            reason: filters.reason || undefined,
            type: filters.type || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            moved_by: filters.moved_by || undefined,
            search: filters.search || undefined,
        });
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            branch_id: '',
            reason: '',
            type: '',
            date_from: '',
            date_to: '',
            moved_by: '',
            search: '',
        });
    };

    const handlePageChange = (page) => {
        fetchAdjustments({
            ...filters,
            page,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Determine reason from notes (format: "reason: {reason_type}")
    const extractReason = (notes) => {
        if (!notes) return 'other';
        const match = notes.match(/reason:\s*(\w+)/);
        return match ? match[1] : 'other';
    };

    // Stats Card Component
    const StatCard = ({ label, value, icon: Icon, color = 'indigo' }) => {
        const bgColor = {
            indigo: 'bg-indigo-50',
            emerald: 'bg-emerald-50',
            teal: 'bg-teal-50',
            red: 'bg-red-50',
        }[color];

        const textColor = {
            indigo: 'text-indigo-700',
            emerald: 'text-emerald-700',
            teal: 'text-teal-700',
            red: 'text-red-700',
        }[color];

        return (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {label}
                    </h3>
                    <div className={`${bgColor} p-2 rounded-lg`}>
                        <Icon className={`size-5 ${textColor}`} />
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <SlidersHorizontal className="size-6 text-indigo-600" />
                            <h1 className="text-2xl font-bold text-slate-900">Stock Adjustments</h1>
                        </div>
                        <p className="text-sm text-slate-500">
                            Correct inventory counts with documented reasons
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        <SlidersHorizontal className="size-4" />
                        New Adjustment
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Total Adjustments"
                        value={stats.total_adjustments || 0}
                        icon={ClipboardList}
                        color="indigo"
                    />
                    <StatCard
                        label="Today"
                        value={stats.today_count || 0}
                        icon={CalendarCheck}
                        color="emerald"
                    />
                    <StatCard
                        label="Added (In)"
                        value={stats.total_in_qty || 0}
                        icon={ArrowDownToLine}
                        color="teal"
                    />
                    <StatCard
                        label="Removed (Out)"
                        value={stats.total_out_qty || 0}
                        icon={ArrowUpFromLine}
                        color="red"
                    />
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="size-4 text-slate-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by product..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>

                        {/* Branch (admin only) */}
                        {userRole === 'admin' && (
                            <select
                                value={filters.branch_id}
                                onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                                disabled={loadingBranches}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm w-36 disabled:opacity-50"
                            >
                                <option value="">All Branches</option>
                                {branches.map((branch) => (
                                    <option key={branch.branch_id} value={branch.branch_id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Reason Filter */}
                        <select
                            value={filters.reason}
                            onChange={(e) => handleFilterChange('reason', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm w-44"
                        >
                            <option value="">All Reasons</option>
                            <option value="damaged">Damaged</option>
                            <option value="theft">Theft</option>
                            <option value="count_correction">Count Correction</option>
                            <option value="transfer">Transfer</option>
                            <option value="expired">Expired</option>
                            <option value="other">Other</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm w-32"
                        >
                            <option value="">All Types</option>
                            <option value="in">Added (In)</option>
                            <option value="out">Removed (Out)</option>
                        </select>

                        {/* Date From */}
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                        />

                        {/* Date To */}
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                        />
                    </div>

                    {/* Clear Filters */}
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Showing {adjustments.length} adjustment
                        {adjustments.length !== 1 ? 's' : ''}
                        {pagination?.total && ` of ${pagination.total}`}
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
                        <Loader className="size-8 text-amber-500 animate-spin mb-2" />
                        <p className="text-slate-600">Loading adjustments...</p>
                    </div>
                ) : adjustments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <SlidersHorizontal className="size-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No adjustments recorded</p>
                        <p className="text-slate-400 text-sm mt-1">
                            Create your first adjustment to get started
                        </p>
                    </div>
                ) : (
                    /* Table */
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Branch
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Qty Change
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Notes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Adjusted By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            New Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {adjustments.map((adj) => {
                                        const reason = extractReason(adj.notes);
                                        const newBalance = adj.current_qty + (adj.movement_type === 'in' ? adj.quantity : -adj.quantity);
                                        
                                        // Determine balance color
                                        let balanceColor = 'text-slate-900';
                                        if (newBalance > adj.current_qty) {
                                            balanceColor = 'text-emerald-700';
                                        } else if (newBalance < adj.current_qty) {
                                            balanceColor = 'text-red-700';
                                        }

                                        return (
                                            <tr
                                                key={adj.movement_id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                {/* Date & Time */}
                                                <td className="px-6 py-4 text-sm">
                                                    <p className="text-slate-700 font-medium">
                                                        {formatDate(adj.movement_time)}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatTime(adj.movement_time)}
                                                    </p>
                                                </td>

                                                {/* Product */}
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Package className="size-4 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {adj.product?.name || 'Unknown'}
                                                            </p>
                                                            {adj.product?.unique_sku && (
                                                                <p className="text-xs font-mono text-slate-400">
                                                                    {adj.product.unique_sku}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Branch */}
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="size-4 text-slate-400" />
                                                        <span className="text-slate-600">
                                                            {adj.branch?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Qty Change */}
                                                <td className="px-6 py-4 text-sm">
                                                    <QtyChangeBadge
                                                        type={adj.movement_type}
                                                        quantity={adj.quantity}
                                                    />
                                                </td>

                                                {/* Reason */}
                                                <td className="px-6 py-4 text-sm">
                                                    <ReasonBadge reason={reason} />
                                                </td>

                                                {/* Notes */}
                                                <td className="px-6 py-4 text-sm">
                                                    <p className="text-xs text-slate-500 line-clamp-1 max-w-32">
                                                        {adj.notes ? adj.notes.split(' | ').slice(1).join(' | ') || '—' : '—'}
                                                    </p>
                                                </td>

                                                {/* Adjusted By */}
                                                <td className="px-6 py-4 text-sm">
                                                    {adj.moved_by ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-bold text-indigo-600">
                                                                    {adj.moved_by.initials}
                                                                </span>
                                                            </div>
                                                            <span className="text-slate-600">
                                                                {adj.moved_by.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>

                                                {/* New Balance */}
                                                <td className={`px-6 py-4 text-sm font-semibold ${balanceColor}`}>
                                                    {newBalance} units
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-600">
                            Page {pagination.current_page} of {pagination.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    handlePageChange(pagination.current_page - 1)
                                }
                                disabled={!pagination.prev_page_url}
                                className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    handlePageChange(pagination.current_page + 1)
                                }
                                disabled={!pagination.next_page_url}
                                className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Next
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Adjustment Modal */}
            <NewAdjustmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userRole={userRole}
                userBranchId={userBranchId}
                branches={branches}
            />
        </div>
    );
};

export default AdjustmentList;
