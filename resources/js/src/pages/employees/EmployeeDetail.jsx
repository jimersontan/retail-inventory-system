import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Building2, Pencil, UserX, UserCheck, User, Mail, Phone, MapPin, Briefcase, DollarSign, Contact as ContactIcon, Activity, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeStore } from '../../store/employeeStore';
import useBranchScope from '../../hooks/useBranchScope';
import EmployeeAvatar from '../../components/employees/EmployeeAvatar';
import StatusBadge from '../../components/employees/StatusBadge';
import RoleBadge from '../../components/employees/RoleBadge';
import EmployeeForm from './EmployeeForm';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchEmployee, selectedEmployee: emp, loading, toggleEmployeeStatus } = useEmployeeStore();
    const { isAdmin } = useBranchScope();

    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEmployee(id).catch((err) => {
                if(err.response?.status === 403 || err.response?.status === 404) {
                    navigate('/employees', { replace: true });
                }
            });
        }
    }, [id]);

    const handleToggleStatus = async () => {
        try {
            await toggleEmployeeStatus(emp.employee_id);
            toast.success('Status updated successfully');
        } catch (err) {}
    };

    if (loading && !emp) {
        return <div className="w-full h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
    }

    if (!emp) return null;

    // Derived properties
    const userRole = emp.user?.user_type || 'cashier';
    const age = emp.profile?.date_of_birth 
        ? Math.floor((Date.now() - new Date(emp.profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : null;

    const formatSalary = (salary) => {
        return Number(salary || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <button onClick={() => navigate('/employees')} className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Employees
                </button>
                <ChevronRight className="text-slate-300 w-4 h-4" />
                <span className="text-slate-900 font-medium">{emp.user?.name}</span>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <EmployeeAvatar name={emp.user?.name} userType={userRole} size="lg" />
                    
                    <div className="flex-1 w-full flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 break-words">{emp.user?.name}</h1>
                            <p className="text-base text-slate-500 mt-0.5 capitalize">{emp.position || 'Staff'}</p>
                            
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <RoleBadge roleType={userRole} />
                                <StatusBadge status={emp.status} />
                                <div className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-sm flex items-center gap-1.5 font-medium">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {emp.branch?.name || 'Unassigned'}
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="flex items-center gap-2 self-start flex-shrink-0">
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${
                                        emp.status === 'active' 
                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                >
                                    {emp.status === 'active' ? (
                                        <><UserX className="w-4 h-4" /> Deactivate</>
                                    ) : (
                                        <><UserCheck className="w-4 h-4" /> Activate</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                
                {/* Contact Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-indigo-600 w-4 h-4" />
                        <span className="text-sm font-semibold text-slate-900">Contact Information</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="text-slate-400 w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                                <p className="text-xs text-slate-400">Login Email</p>
                                <p className="text-sm text-slate-700 truncate">{emp.user?.email || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Phone className="text-slate-400 w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                                <p className="text-xs text-slate-400">Phone</p>
                                <p className="text-sm text-slate-700">{emp.user?.phone || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <MapPin className="text-slate-400 w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                                <p className="text-xs text-slate-400">Address</p>
                                <p className="text-sm text-slate-700 truncate">{emp.user?.address || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employment */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="text-indigo-600 w-4 h-4" />
                        <span className="text-sm font-semibold text-slate-900">Employment Details</span>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-xs text-slate-400">Branch</p>
                                <p className="text-sm text-slate-700 truncate">{emp.branch?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Role</p>
                                <p className="text-sm text-slate-700 capitalize">{userRole}</p>
                            </div>
                            <div className="mt-1">
                                <p className="text-xs text-slate-400">Position</p>
                                <p className="text-sm text-slate-700 truncate capitalize">{emp.position || 'Staff'}</p>
                            </div>
                            <div className="mt-1">
                                <p className="text-xs text-slate-400">Hire Date</p>
                                <p className="text-sm text-slate-700">
                                    {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Admin only Salary view */}
                    {isAdmin && (
                        <div className="bg-amber-50 rounded-lg p-3 mt-4 flex items-center gap-2 border border-amber-100">
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="text-amber-500 w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-amber-700/70 font-medium">Base Salary</p>
                                <p className="text-sm text-amber-800 font-semibold">₱ {formatSalary(emp.salary)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <ContactIcon className="text-indigo-600 w-4 h-4" />
                        <span className="text-sm font-semibold text-slate-900">Profile Information</span>
                    </div>
                    <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-xs text-slate-400">Date of Birth</p>
                                <p className="text-sm text-slate-700">
                                    {emp.profile?.date_of_birth ? new Date(emp.profile.date_of_birth).toLocaleDateString() : '—'}
                                    {age ? ` (Age ${age})` : ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Gender</p>
                                <p className="text-sm text-slate-700 capitalize">{emp.profile?.gender || '—'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <p className="text-xs text-slate-400">ZIP</p>
                                <p className="text-sm text-slate-700">{emp.profile?.zip || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Alt Phone</p>
                                <p className="text-sm text-slate-700 truncate">{emp.profile?.phone_no || '—'}</p>
                            </div>
                        </div>
                         <div>
                            <p className="text-xs text-slate-400">Personal Email</p>
                            <p className="text-sm text-slate-700 truncate">{emp.profile?.email || '—'}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6 shadow-sm max-w-2xl">
                <div className="flex items-center gap-2">
                    <Activity className="text-indigo-600 w-4 h-4" />
                    <span className="text-sm font-semibold text-slate-900">Recent Activity</span>
                </div>
                
                <div className="space-y-4 mt-6">
                    {/* Mock Activity Data mapping visual layout.
                        Production would map emp.stockMovements / sales here. */}
                    
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1" />
                            <div className="w-px h-full bg-slate-100 my-1" />
                        </div>
                        <div className="pb-4">
                            <p className="text-sm text-slate-700">
                                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded mr-1.5 border border-emerald-100">Stock In</span>
                                Received <strong>Coca Cola Case</strong> batch.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Qty: 50 · Oct 15, 2023, 10:00 AM</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1" />
                            <div className="w-px h-full bg-slate-100 my-1" />
                        </div>
                        <div className="pb-4">
                             <p className="text-sm text-slate-700">
                                <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded mr-1.5 border border-red-100">Sale</span>
                                Processed order #INV-0082.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Total: ₱ 2,400.00 · Oct 14, 2023, 2:30 PM</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1" />
                            {/* No connector line on last item */}
                        </div>
                        <div>
                             <p className="text-sm text-slate-700">
                                <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded mr-1.5 border border-amber-100">Adjust</span>
                                Rectified discrepancy on <strong>Lays Chips</strong>.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Qty: -2 · Oct 12, 2023, 9:15 AM</p>
                        </div>
                    </div>
                    
                </div>
            </div>

            <EmployeeForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                employee={emp}
            />

        </div>
    );
};

export default EmployeeDetail;
