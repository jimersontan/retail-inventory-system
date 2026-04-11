import React, { useState, useEffect } from 'react';
import { UserPlus, X, User, Mail, Lock, Eye, EyeOff, Phone, Briefcase, ShoppingCart, Building2, Shield, Tag, Calendar, DollarSign, Info, Contact, MapPin, HelpCircle, ChevronLeft, ArrowRight, Check, Loader2, Mars, Venus, Circle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeStore } from '../../store/employeeStore';
import { useBranchStore } from '../../store/branchStore';
import useBranchScope from '../../hooks/useBranchScope';
import StepIndicator from '../../components/ui/StepIndicator';

const STEPS = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Employment' },
    { id: 3, label: 'Profile' }
];

const EmployeeForm = ({ isOpen, onClose, employee = null }) => {
    const isEdit = Boolean(employee);
    const { isAdmin } = useBranchScope();
    const { createEmployee, updateEmployee, loading } = useEmployeeStore();
    const { branches } = useBranchStore(); // Ensure parent fetched these

    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    
    // Core state mapped to all DB layers
    const [formData, setFormData] = useState({
        // User (Account)
        name: '', email: '', password: '', password_confirmation: '', user_type: 'cashier', phone: '', address: '',
        // Employee
        branch_id: '', role_id: '', position: '', hire_date: '', salary: '', status: 'active',
        // Profile
        profile_phone_no: '', profile_email: '', date_of_birth: '', gender: 'other', zip: '', key_field: ''
    });

    const [errors, setErrors] = useState({});

    // Hardcode roles API array since /roles endpoint might not exist standalone 
    const roles = [
        { role_id: 1, role_name: 'Admin' },
        { role_id: 2, role_name: 'Manager' },
        { role_id: 3, role_name: 'Cashier' }
    ];

    useEffect(() => {
        if (isOpen && employee) {
            setFormData({
                name: employee.user?.name || '',
                email: employee.user?.email || '',
                password: '', password_confirmation: '',
                user_type: employee.user?.user_type || 'cashier',
                phone: employee.user?.phone || '',
                address: employee.user?.address || '',
                
                branch_id: employee.branch_id || '',
                role_id: employee.role_id || '',
                position: employee.position || '',
                hire_date: employee.hire_date_raw ? employee.hire_date_raw.split(' ')[0] : '', // simple YYYY-MM-DD extract
                salary: employee.salary || '',
                status: employee.status || 'active',

                profile_phone_no: employee.profile?.phone_no || '',
                profile_email: employee.profile?.email || '',
                date_of_birth: employee.profile?.date_of_birth ? employee.profile.date_of_birth.split(' ')[0] : '',
                gender: employee.profile?.gender || 'other',
                zip: employee.profile?.zip || '',
                key_field: employee.profile?.key_field || ''
            });
            setCurrentStep(1);
        } else if (isOpen) {
            setFormData({
                name: '', email: '', password: '', password_confirmation: '', user_type: 'cashier', phone: '', address: '',
                branch_id: '', role_id: '', position: '', hire_date: '', salary: '', status: 'active',
                profile_phone_no: '', profile_email: '', date_of_birth: '', gender: 'other', zip: '', key_field: ''
            });
            setCurrentStep(1);
        }
        setErrors({});
    }, [isOpen, employee]);

    if (!isOpen) return null;

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name) newErrors.name = 'Name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            if (!isEdit && !formData.password) newErrors.password = 'Password is required';
            if (formData.password && formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Passwords do not match';
            }
        } else if (step === 2) {
            if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
            if (!formData.role_id) newErrors.role_id = 'Role is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        try {
            if (isEdit) {
                await updateEmployee(employee.employee_id, formData);
                toast.success('Employee updated successfully');
            } else {
                await createEmployee(formData);
                toast.success('Employee created successfully');
            }
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
                toast.error('Please check the form for errors');
            } else {
                toast.error(err.response?.data?.message || 'Submission failed');
            }
        }
    };

    // Calculate age 
    let age = null;
    if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        if (!isNaN(dob.getTime())) {
            const diff = Date.now() - dob.getTime();
            age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }
    }

    const renderInputProps = (field) => ({
        value: formData[field] || '',
        onChange: (e) => setFormData({...formData, [field]: e.target.value}),
        className: `pl-10 h-10 w-full text-sm border rounded-lg focus:ring-2 outline-none ${
            errors[field] ? 'border-red-300 focus:ring-red-300' : 'border-slate-200 focus:ring-indigo-500'
        }`
    });

    const renderError = (field) => errors[field] ? (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors[field][0] || errors[field]}
        </p>
    ) : null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative my-auto">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <UserPlus className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                {isEdit ? 'Edit Employee' : 'Add New Employee'}
                            </p>
                            <p className="text-sm text-slate-500">
                                {isEdit ? 'Update employee and user records' : 'Create a new user and employee profile'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Steps */}
                <div className="px-6 pt-5 mb-6">
                    <StepIndicator currentStep={currentStep} steps={STEPS} />
                </div>

                {/* Body Content */}
                <div className="px-6 pb-6 min-h-[350px]">
                    
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2 mb-4">
                                <UserPlus className="text-indigo-600 w-5 h-5" />
                                <span className="text-base font-semibold text-slate-900">Account Information</span>
                                <span className="text-sm text-slate-500 ml-2">Create the user login account</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 relative">
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" placeholder="Full name" {...renderInputProps('name')} />
                                    </div>
                                    {renderError('name')}
                                </div>

                                <div className="relative col-span-2 border-b border-slate-100 pb-2">
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="email" placeholder="email@address.com" {...renderInputProps('email')} />
                                        {/* Mocking success ping if filled */}
                                        {formData.email && !errors.email && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />}
                                    </div>
                                    {renderError('email')}
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Password {isEdit && <span className="text-slate-400 font-normal text-xs ml-1">(Leave blank to keep)</span>}{!isEdit && <span className="text-red-500">*</span>}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type={showPassword ? "text" : "password"} {...renderInputProps('password')} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {renderError('password')}
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type={showPassword ? "text" : "password"} {...renderInputProps('password_confirmation')} />
                                    </div>
                                    {renderError('password_confirmation')}
                                </div>

                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700 block mb-2">Role Permissions <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setFormData({...formData, user_type: 'manager', role_id: 2})}
                                            className={`text-left rounded-xl p-4 transition-all border-2 ${formData.user_type === 'manager' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <Briefcase className={`w-6 h-6 mb-2 ${formData.user_type === 'manager' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            <p className={`font-medium text-sm ${formData.user_type === 'manager' ? 'text-indigo-900' : 'text-slate-700'}`}>Manager</p>
                                            <p className={`text-xs ${formData.user_type === 'manager' ? 'text-indigo-500' : 'text-slate-400'}`}>Inventory & team access</p>
                                        </button>

                                        <button
                                            onClick={() => setFormData({...formData, user_type: 'cashier', role_id: 3})}
                                            className={`text-left rounded-xl p-4 transition-all border-2 ${formData.user_type === 'cashier' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <ShoppingCart className={`w-6 h-6 mb-2 ${formData.user_type === 'cashier' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            <p className={`font-medium text-sm ${formData.user_type === 'cashier' ? 'text-indigo-900' : 'text-slate-700'}`}>Cashier</p>
                                            <p className={`text-xs ${formData.user_type === 'cashier' ? 'text-indigo-500' : 'text-slate-400'}`}>POS & sales access</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-2 mb-4">
                                <Briefcase className="text-indigo-600 w-5 h-5" />
                                <span className="text-base font-semibold text-slate-900">Employment Details</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Branch <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <select 
                                            value={formData.branch_id} 
                                            onChange={(e) => setFormData({...formData, branch_id: e.target.value})} 
                                            className="pl-10 h-11 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="">Select a branch</option>
                                            {branches.filter(b => b.is_active).map(b => (
                                                <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {renderError('branch_id')}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Role Group <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <select 
                                            value={formData.role_id} 
                                            onChange={(e) => setFormData({...formData, role_id: e.target.value})} 
                                            className="pl-10 h-11 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="">Select role</option>
                                            {roles.map(r => (
                                                <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {renderError('role_id')}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Job Position</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" placeholder="e.g. Store Supervisor" {...renderInputProps('position')} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Hire Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input 
                                            type="date" 
                                            max={new Date().toISOString().split('T')[0]} 
                                            {...renderInputProps('hire_date')} 
                                            className="pl-10 h-10 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-sm font-medium text-slate-700 block mb-1">Base Salary</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₱</span>
                                            <input 
                                                type="number" step="0.01" min="0" 
                                                value={formData.salary} 
                                                onChange={(e) => setFormData({...formData, salary: e.target.value})} 
                                                className="pl-8 h-10 w-full text-sm rounded-lg outline-none bg-amber-50 border border-amber-200 focus:ring-2 focus:ring-amber-400"
                                            />
                                        </div>
                                        <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                            <Info className="w-3 h-3" /> Visible to admin only
                                        </p>
                                    </div>
                                )}

                                <div className="col-span-2 mt-2 border-t border-slate-100 pt-3">
                                    <label className="text-sm font-medium text-slate-700 block mb-2">Employment Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'active'})}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                                                formData.status === 'active' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'inactive'})}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                                                formData.status === 'inactive' ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            Inactive
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'on_leave'})}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                                                formData.status === 'on_leave' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            On Leave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-2 mb-4">
                                <Contact className="text-indigo-600 w-5 h-5" />
                                <span className="text-base font-semibold text-slate-900">Personal Profile</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input 
                                            type="date" 
                                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} 
                                            {...renderInputProps('date_of_birth')} 
                                            className="pl-10 h-10 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    {age !== null && <p className="text-xs text-slate-400 mt-1">Age: {age} years old</p>}
                                </div>

                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700 block mb-2">Gender</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setFormData({...formData, gender: 'male'})}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                formData.gender === 'male' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            <Mars className={`w-4 h-4 ${formData.gender === 'male' ? 'text-indigo-600' : 'text-slate-400'}`} /> Male
                                        </button>
                                        <button
                                            onClick={() => setFormData({...formData, gender: 'female'})}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                formData.gender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium' : 'border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            <Venus className={`w-4 h-4 ${formData.gender === 'female' ? 'text-pink-600' : 'text-slate-400'}`} /> Female
                                        </button>
                                        <button
                                            onClick={() => setFormData({...formData, gender: 'other'})}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                formData.gender === 'other' ? 'border-slate-500 bg-slate-100 text-slate-800 font-medium' : 'border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            <Circle className={`w-4 h-4 ${formData.gender === 'other' ? 'text-slate-600' : 'text-slate-400'}`} /> Other
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Personal Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" placeholder="09XXXXXXXXX" {...renderInputProps('profile_phone_no')} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Personal Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="email" placeholder="personal@email.com" {...renderInputProps('profile_email')} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">ZIP / Postal Code</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" maxLength={10} placeholder="1100" {...renderInputProps('zip')} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Key Identifier</label>
                                    <div className="relative">
                                        <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" placeholder="Employee ID / Badge" {...renderInputProps('key_field')} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Optional additional identifier</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm text-slate-400 font-medium">
                        Step {currentStep} of {STEPS.length}
                    </div>
                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                disabled={loading}
                                className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Check className="w-4 h-4" /> {isEdit ? 'Update Employee' : 'Create Employee'}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeForm;
