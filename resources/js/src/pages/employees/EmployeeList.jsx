import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users as UsersIcon, UserCheck, UserX, Clock, UserSearch, Building2, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeStore } from '../../store/employeeStore';
import { useBranchStore } from '../../store/branchStore';
import useBranchScope from '../../hooks/useBranchScope';
import EmployeeAvatar from '../../components/employees/EmployeeAvatar';
import StatusBadge from '../../components/employees/StatusBadge';
import RoleBadge from '../../components/employees/RoleBadge';
import EmployeeForm from './EmployeeForm';

// Simple debounce hook for search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const EmployeeList = () => {
    const navigate = useNavigate();
    const { isAdmin } = useBranchScope();
    const { employees, pagination, loading, fetchEmployees, toggleEmployeeStatus } = useEmployeeStore();
    const { branches, fetchBranches } = useBranchStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [branchId, setBranchId] = useState('');
    const [roleId, setRoleId] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (isAdmin) {
            fetchBranches().catch(() => {});
        }
    }, [isAdmin]);

    useEffect(() => {
        const params = { page: pagination.currentPage };
        if (debouncedSearch) params.search = debouncedSearch;
        if (branchId) params.branch_id = branchId;
        if (roleId) params.role_id = roleId;
        if (statusFilter !== 'all') params.status = statusFilter;
        
        fetchEmployees(params).catch(() => {});
    }, [debouncedSearch, branchId, roleId, statusFilter, pagination.currentPage]);

    // Format helpers
    const formatSalary = (salary) => {
        if (!isAdmin) return <span className="text-slate-300 text-sm">—</span>;
        const formatted = Number(salary || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
        return <span className="text-sm font-medium text-slate-700">₱ {formatted}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleCreate = () => {
        setSelectedEmployee(null);
        if (isAdmin) {
            fetchBranches().catch(() => {});
        }
        setIsFormOpen(true);
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        if (isAdmin) {
            fetchBranches().catch(() => {});
        }
        setIsFormOpen(true);
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleEmployeeStatus(id);
            toast.success('Employee status updated');
        } catch (err) {}
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.lastPage) {
            // Updating pagination state effectively triggers the useEffect above
            useEmployeeStore.setState((state) => ({ 
                pagination: { ...state.pagination, currentPage: page } 
            }));
        }
    };

    // Derived stats visually matching specification
    const totalCount = pagination.total || 0;
    // In a real paginated app, total active vs inactive might require a separate count API, 
    // but for the UI mock we'll use local filtered counts if possible or just show 0 if not available universally.
    const activeCount = employees.filter(e => e.status === 'active').length; 
    const inactiveCount = employees.filter(e => e.status === 'inactive').length;
    const leaveCount = employees.filter(e => e.status === 'on_leave').length;

    // Generate pagination array map
    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= pagination.lastPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Employee Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your team across all branches</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> Add Employee
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Employees', value: totalCount, Icon: UsersIcon, bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
                    { label: 'Active', value: activeCount, Icon: UserCheck, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'Inactive', value: inactiveCount, Icon: UserX, bg: 'bg-red-50', iconColor: 'text-red-500' },
                    { label: 'On Leave', value: leaveCount, Icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[12rem] relative">
                    <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full h-10 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {isAdmin && (
                    <select
                        className="w-44 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                        ))}
                    </select>
                )}

                {/* For mock purposes we can hardcode roles or assume a mapped list. In a full app fetch from roleStore. */}
                <select
                    className="w-36 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="1">Admin</option>
                    <option value="2">Manager</option>
                    <option value="3">Cashier</option>
                </select>

                <select
                    className="w-40 h-10 text-sm border border-slate-200 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                </select>

                <div className="ml-auto text-sm text-slate-500 self-center">
                    {pagination.total} employees found
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hired</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4 flex gap-3"><div className="w-9 h-9 bg-slate-200 rounded-full" /><div className="flex-1"><div className="h-4 bg-slate-200 rounded w-24 mb-1" /><div className="h-3 bg-slate-200 rounded w-32" /></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded px-2 w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12" /></td>
                                    </tr>
                                ))
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <UsersIcon className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-500 font-medium mt-3 text-sm">No employees found</p>
                                            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar name={emp.user?.name} userType={emp.user?.user_type} />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{emp.user?.name}</p>
                                                    <p className="text-xs text-slate-400">{emp.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-3 h-3 text-slate-400" />
                                                <span className="text-sm text-slate-600">{emp.branch?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge roleType={emp.user?.user_type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600">{emp.position || 'Staff'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={emp.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatSalary(emp.salary)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(emp.hire_date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/employees/${emp.employee_id}`)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(emp)}
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(emp.employee_id)}
                                                            className={`p-1.5 rounded-md transition-colors ${
                                                                emp.status === 'active'
                                                                    ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                            title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {emp.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

            {/* Pagination */}
            {pagination.lastPage > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {(pagination.currentPage - 1) * pagination.perPage + 1}-
                        {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} employees
                    </p>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="w-9 h-9 rounded-lg text-sm font-medium transition-colors bg-white border text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center p-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {getPageNumbers().map(num => (
                            <button
                                key={num}
                                onClick={() => handlePageChange(num)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                    pagination.currentPage === num 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-white border text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {num}
                            </button>
                        ))}

                        <button 
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="w-9 h-9 rounded-lg text-sm font-medium transition-colors bg-white border text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center p-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <EmployeeForm 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    employee={selectedEmployee} 
                />
            )}
        </div>
    );
};

export default EmployeeList;
