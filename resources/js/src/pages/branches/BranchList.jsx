import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, CheckCircle, XCircle, Star, Plus, Phone, Users, Package, AlertTriangle, Eye, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBranchStore } from '../../store/branchStore';
import useBranchScope from '../../hooks/useBranchScope';
import BranchForm from './BranchForm';
import BranchTypeBadge from '../../components/branches/BranchTypeBadge';
import BranchStatusBadge from '../../components/branches/BranchStatusBadge';

const BranchList = () => {
    const navigate = useNavigate();
    const { isAdmin, canEdit } = useBranchScope();
    const { branches, fetchBranches, loading, toggleBranchStatus } = useBranchStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchBranches().catch(() => {});
    }, []);

    const filteredBranches = useMemo(() => {
        return branches.filter((b) => {
            const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                                  b.address.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter ? b.type === typeFilter : true;
            const matchesStatus = statusFilter !== '' ? b.is_active === (statusFilter === 'true') : true;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [branches, search, typeFilter, statusFilter]);

    // Stats
    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.is_active).length;
    const inactiveBranches = branches.filter(b => !b.is_active).length;
    const mainBranches = branches.filter(b => b.type === 'main').length;

    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        fetchBranches().catch(() => {});
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedBranch(null);
        fetchBranches().catch(() => {});
        setIsFormOpen(true);
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleBranchStatus(id);
            toast.success('Status updated');
        } catch (err) {
            // Error managed in store/toast component
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Branch Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your retail store locations</p>
                </div>
                {isAdmin && (
                    <div>
                        <button
                            onClick={handleCreate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> 
                            Add Branch
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Branches', value: totalBranches, Icon: Building2, iconColors: 'bg-indigo-50 text-indigo-600' },
                    { label: 'Active', value: activeBranches, Icon: CheckCircle, iconColors: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Inactive', value: inactiveBranches, Icon: XCircle, iconColors: 'bg-red-50 text-red-500' },
                    { label: 'Main Branches', value: mainBranches, Icon: Star, iconColors: 'bg-amber-50 text-amber-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconColors}`}>
                            <stat.Icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-3 flex-wrap shadow-sm">
                <div className="flex-1 min-w-[12rem] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="search"
                        placeholder="Search branches..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 w-full h-10 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                
                <select
                    className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="main">Main</option>
                    <option value="satellite">Satellite</option>
                </select>

                <select
                    className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <div className="ml-auto text-sm text-slate-500 self-center">
                    {filteredBranches.length} branches found
                </div>
            </div>

            {/* Branches Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employees</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                // Loading Skeleton
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                                    </tr>
                                ))
                            ) : filteredBranches.length === 0 ? (
                                // Empty State
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <Building2 className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-500 font-medium mt-3 text-sm">No branches found</p>
                                            <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <tr key={branch.branch_id} className="hover:bg-slate-50 transition-colors">
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="text-indigo-500 w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{branch.name}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{branch.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <BranchTypeBadge type={branch.type} />
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="text-slate-400 w-3 h-3" />
                                                <span className="text-sm text-slate-600">{branch.contact}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="text-slate-400 w-3 h-3" />
                                                <span className="text-sm font-medium text-slate-700">{branch.employee_count}</span>
                                                <span className="text-xs text-slate-400">staff</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="text-slate-400 w-3 h-3" />
                                                    <span className="text-sm font-medium text-slate-700">{branch.inventory_count} products</span>
                                                </div>
                                                {branch.low_stock_count > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <AlertTriangle className="text-amber-500 w-3 h-3" />
                                                        <span className="text-xs text-amber-600 font-medium">{branch.low_stock_count} low stock</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <BranchStatusBadge isActive={branch.is_active} />
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {/* All roles can view detail */}
                                                <button
                                                    onClick={() => navigate(`/branches/${branch.branch_id}`)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(branch)}
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(branch.branch_id)}
                                                            className={`p-1.5 rounded-md transition-colors ${
                                                                branch.is_active 
                                                                    ? 'text-emerald-500 hover:text-red-500 hover:bg-red-50' 
                                                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                            title="Toggle Status"
                                                        >
                                                            {branch.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BranchForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                branch={selectedBranch} 
            />
            
        </div>
    );
};

export default BranchList;
