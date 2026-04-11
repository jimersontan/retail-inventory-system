import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, ChevronRight, MapPin, Phone, Users, Package, AlertTriangle, Eye, Pencil, Loader2, Link as LinkIcon } from 'lucide-react';
import { useBranchStore } from '../../store/branchStore';
import useBranchScope from '../../hooks/useBranchScope';
import BranchTypeBadge from '../../components/branches/BranchTypeBadge';
import BranchStatusBadge from '../../components/branches/BranchStatusBadge';
import BranchForm from './BranchForm';
import toast from 'react-hot-toast';

const BranchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchBranch, selectedBranch, loading, toggleBranchStatus } = useBranchStore();
    const { isAdmin } = useBranchScope();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBranch(id).catch((err) => {
                if(err.response?.status === 403 || err.response?.status === 404) {
                    navigate('/branches', { replace: true });
                }
            });
        }
    }, [id, fetchBranch, navigate]);

    const handleToggleStatus = async () => {
        try {
            await toggleBranchStatus(selectedBranch.branch_id);
            toast.success('Status updated');
        } catch (err) { }
    };

    if (loading && !selectedBranch) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!selectedBranch) return null;

    const b = selectedBranch;
    const employees = b.employees || [];
    const inventory = b.inventory || [];
    
    // Derived stats
    const totalEmployees = employees.length;
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(i => i.quantity <= 10).length;

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <button onClick={() => navigate('/branches')} className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Branches
                </button>
                <ChevronRight className="text-slate-300 w-4 h-4" />
                <span className="text-slate-900 font-medium">{b.name}</span>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="text-indigo-600 w-8 h-8" />
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 break-words">{b.name}</h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <BranchTypeBadge type={b.type} />
                                <BranchStatusBadge isActive={b.is_active} />
                            </div>
                            
                            <p className="text-sm text-slate-500 mt-3 flex flex-wrap items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" /> 
                                {b.address}
                            </p>
                            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-slate-400" /> 
                                {b.contact}
                            </p>
                        </div>

                        {isAdmin && (
                            <div className="flex items-center gap-2 self-start flex-shrink-0">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${
                                        b.is_active 
                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                                    }`}
                                >
                                    {b.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Employees</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalEmployees}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50">
                        <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Products</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalProducts}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                        <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Low Stock Items</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{lowStockItems}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockItems > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <AlertTriangle className={`w-5 h-5 ${lowStockItems > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employees Table Card */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                        <h3 className="text-base font-semibold text-slate-900">Employees</h3>
                        <span className="bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                            {totalEmployees}
                        </span>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="bg-slate-50/50 text-xs text-slate-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Position</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                                            No employees assigned yet.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr key={emp.employee_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                                        {(emp.user?.name?.[0] || emp.user?.email?.[0] || 'U')}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{emp.user?.name || 'Unknown User'}</div>
                                                        <div className="text-xs text-slate-500">{emp.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600 capitalize">{emp.position || 'Staff'}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                                                    emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Summary Card */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                        <h3 className="text-base font-semibold text-slate-900">Inventory Summary</h3>
                        <Link to="/inventory" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 transition-colors">
                            View full inventory <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="bg-slate-50/50 text-xs text-slate-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Product / SKU</th>
                                    <th className="px-6 py-3 font-medium">Qty</th>
                                    <th className="px-6 py-3 font-medium">Fill %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => {
                                    const product = item.product || { name: 'Unknown', sku: item.sku || 'N/A' };
                                    const max = item.maximum_stock > 0 ? item.maximum_stock : 100; 
                                    const percent = Math.min(100, Math.round((item.quantity / max) * 100));
                                    
                                    // Qty cell color coding
                                    let qtyColor = 'text-slate-700';
                                    if (item.quantity <= 10) qtyColor = 'text-red-700 font-medium';
                                    else if (item.quantity > 10 && item.quantity <= max * 0.5) qtyColor = 'text-amber-700 font-medium';
                                    else qtyColor = 'text-emerald-700 font-medium';

                                    // Bar color
                                    let barColor = 'bg-emerald-400';
                                    if (percent <= 10) barColor = 'bg-red-400';
                                    else if (percent > 10 && percent <= 50) barColor = 'bg-amber-400';

                                    return (
                                        <tr key={item.inventory_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="px-6 py-3">
                                                <div className="font-semibold text-slate-900 truncate max-w-[150px]">{product.name}</div>
                                                <div className="text-xs text-slate-400">{product.sku}</div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`${qtyColor} flex items-center gap-1`}>
                                                    {item.quantity <= 10 && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-500">{percent}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {inventory.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                                            No inventory items tracked yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <BranchForm 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                branch={selectedBranch}
            />

        </div>
    );
};

export default BranchDetail;
