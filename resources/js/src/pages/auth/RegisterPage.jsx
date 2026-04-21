import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShoppingCart, Package, User, Mail, Lock, Eye, EyeOff,
    Phone, MapPin, Building2, Store, AlertCircle, Loader2,
    CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, Sparkles
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

/* ── Step Configuration ───────────────────────── */
const STEPS = [
    { id: 1, title: 'Personal Info', desc: 'Your basic details' },
    { id: 2, title: 'Contact & Location', desc: 'How we reach you' },
    { id: 3, title: 'Account Security', desc: 'Create your password' },
];

const RegisterPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        branch_id: '',
        store_name: '',
        password: '',
        password_confirmation: '',
    });

    // Fetch branches on mount
    useEffect(() => {
        api.get('/branches-public')
            .then(res => {
                const data = res.data?.data || res.data || [];
                setBranches(Array.isArray(data) ? data : []);
            })
            .catch(() => setBranches([]));
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error on change
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    /* ── Per-step validation ──────────────────────── */
    const validateStep = (step) => {
        const errs = {};

        if (step === 1) {
            if (!formData.name.trim()) errs.name = 'Full name is required';
            if (!formData.email.trim()) errs.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                errs.email = 'Please enter a valid email address';
        }

        if (step === 2) {
            if (!formData.phone.trim()) errs.phone = 'Phone number is required';
            if (!formData.address.trim()) errs.address = 'Address is required';
            if (!formData.branch_id) errs.branch_id = 'Please select a preferred branch';
        }

        if (step === 3) {
            if (!formData.password) errs.password = 'Password is required';
            else if (formData.password.length < 8)
                errs.password = 'Password must be at least 8 characters';
            if (!formData.password_confirmation)
                errs.password_confirmation = 'Please confirm your password';
            else if (formData.password !== formData.password_confirmation)
                errs.password_confirmation = 'Passwords do not match';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    /* ── Submit registration ─────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setIsLoading(true);
        setErrors({});

        try {
            const res = await api.post('/register', formData);
            const { token, user } = res.data;

            // Log the user in automatically
            useAuthStore.setState({
                user: user?.data || user,
                token,
                isAuthenticated: true,
            });

            toast.success('Account created! Welcome to RIS.', { duration: 4000 });
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data?.errors || {};
                setErrors(serverErrors);

                // Jump to the step that has the error
                const stepOneFields = ['name', 'email'];
                const stepTwoFields = ['phone', 'address', 'branch_id', 'store_name'];
                const errorFields = Object.keys(serverErrors);

                if (errorFields.some(f => stepOneFields.includes(f))) setCurrentStep(1);
                else if (errorFields.some(f => stepTwoFields.includes(f))) setCurrentStep(2);
                else setCurrentStep(3);

                toast.error('Please fix the highlighted errors');
            } else {
                toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ── Field error helper ──────────────────────── */
    const fieldError = (field) => {
        const err = errors[field];
        if (!err) return null;
        const message = Array.isArray(err) ? err[0] : err;
        return (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5 ml-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {message}
            </p>
        );
    };

    /* ── Input class helper ──────────────────────── */
    const inputClass = (field) =>
        `w-full h-12 bg-slate-50 border ${errors[field] ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-xl px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`;

    const inputWithIconClass = (field) =>
        `w-full h-12 bg-slate-50 border ${errors[field] ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-xl pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`;

    /* ── Password strength ───────────────────────── */
    const getPasswordStrength = (pw) => {
        if (!pw) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        const levels = [
            { level: 0, label: '', color: '' },
            { level: 1, label: 'Weak', color: 'bg-red-400' },
            { level: 2, label: 'Fair', color: 'bg-amber-400' },
            { level: 3, label: 'Good', color: 'bg-blue-400' },
            { level: 4, label: 'Strong', color: 'bg-emerald-400' },
        ];
        return levels[score];
    };

    const pwStrength = getPasswordStrength(formData.password);

    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* LEFT PANEL — Branding */}
            <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 flex-col items-center justify-center px-12 relative">
                {/* Decorative */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute bottom-32 right-8 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl" />
                <div className="absolute top-1/4 right-16 w-20 h-20 bg-indigo-300/10 rounded-full blur-xl" />

                <div className="relative z-10 text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/10">
                        <ShoppingCart className="text-white size-8" />
                    </div>

                    <h1 className="text-white text-3xl font-bold mt-6">
                        Join RIS Today
                    </h1>

                    <p className="text-white/50 text-sm max-w-xs leading-relaxed mt-3 mx-auto">
                        Create your customer account and start ordering products from our branches.
                    </p>

                    <div className="mt-10 space-y-4 text-left">
                        {[
                            'Browse products from all branches',
                            'Place orders for pickup',
                            'Track your order status in real-time',
                            'Write reviews on purchased products',
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="text-indigo-300 size-5 shrink-0" />
                                <span className="text-white/80 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 text-white/20 text-xs">
                    &copy; 2024 RIS &middot; Retail Inventory System
                </div>
            </div>

            {/* RIGHT PANEL — Registration Form */}
            <div className="flex-1 flex items-center justify-center bg-white relative overflow-y-auto py-8">
                <div className="w-full max-w-md px-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Package className="text-white w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">RIS</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mt-6">Create your account</h2>
                    <p className="text-sm text-slate-500 mt-1 mb-8">
                        Fill in your details to get started as a customer
                    </p>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-0 mb-8">
                        {STEPS.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Allow going back to completed steps
                                        if (step.id < currentStep) setCurrentStep(step.id);
                                    }}
                                    className={`flex items-center gap-2 group transition-all ${
                                        step.id < currentStep ? 'cursor-pointer' : step.id === currentStep ? 'cursor-default' : 'cursor-default'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        step.id < currentStep
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : step.id === currentStep
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {step.id < currentStep ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className={`text-xs font-semibold leading-none ${
                                            step.id === currentStep ? 'text-slate-900' : 'text-slate-400'
                                        }`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </button>
                                {idx < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                                        step.id < currentStep ? 'bg-emerald-300' : 'bg-slate-100'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ── Step 1: Personal Info ────────────── */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Information</span>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Juan Dela Cruz"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className={inputWithIconClass('name')}
                                        />
                                    </div>
                                    {fieldError('name')}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className={inputWithIconClass('email')}
                                        />
                                    </div>
                                    {fieldError('email')}
                                </div>

                                {/* Store Name (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Store Name <span className="text-slate-400 font-normal">(optional, for resellers)</span>
                                    </label>
                                    <div className="relative">
                                        <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="My Pet Store"
                                            value={formData.store_name}
                                            onChange={(e) => handleChange('store_name', e.target.value)}
                                            className={inputWithIconClass('store_name')}
                                        />
                                    </div>
                                    {fieldError('store_name')}
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Contact & Location ──────── */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact & Location</span>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="09XX XXX XXXX"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className={inputWithIconClass('phone')}
                                        />
                                    </div>
                                    {fieldError('phone')}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Complete Address *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <textarea
                                            placeholder="House/Unit #, Street, Barangay, City, Province"
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            rows={3}
                                            className={`w-full bg-slate-50 border ${errors.address ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
                                        />
                                    </div>
                                    {fieldError('address')}
                                </div>

                                {/* Preferred Branch */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Branch *</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <select
                                            value={formData.branch_id}
                                            onChange={(e) => handleChange('branch_id', e.target.value)}
                                            className={`${inputWithIconClass('branch_id')} appearance-none cursor-pointer`}
                                        >
                                            <option value="">Select your preferred branch</option>
                                            {branches.map(b => (
                                                <option key={b.branch_id} value={b.branch_id}>
                                                    {b.name} {b.address ? `— ${b.address}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none rotate-90" />
                                    </div>
                                    {fieldError('branch_id')}
                                    <p className="text-[11px] text-slate-400 mt-1.5 ml-0.5">
                                        This is where you'll pick up your orders
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Account Security ────────── */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lock className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Security</span>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 8 characters"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className={`${inputWithIconClass('password')} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {fieldError('password')}

                                    {/* Password Strength Bar */}
                                    {formData.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                            i <= pwStrength.level ? pwStrength.color : 'bg-slate-100'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-[11px] mt-1 font-medium ${
                                                pwStrength.level <= 1 ? 'text-red-500' :
                                                pwStrength.level === 2 ? 'text-amber-500' :
                                                pwStrength.level === 3 ? 'text-blue-500' :
                                                'text-emerald-500'
                                            }`}>
                                                {pwStrength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            value={formData.password_confirmation}
                                            onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                            className={`${inputWithIconClass('password_confirmation')} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {fieldError('password_confirmation')}

                                    {/* Match indicator */}
                                    {formData.password_confirmation && formData.password === formData.password_confirmation && (
                                        <p className="flex items-center gap-1 text-xs text-emerald-500 mt-1.5 ml-0.5">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Passwords match
                                        </p>
                                    )}
                                </div>

                                {/* Summary Card */}
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mt-6">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Account Summary</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Name</span>
                                            <span className="text-slate-900 font-medium">{formData.name || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Email</span>
                                            <span className="text-slate-900 font-medium">{formData.email || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Phone</span>
                                            <span className="text-slate-900 font-medium">{formData.phone || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Branch</span>
                                            <span className="text-slate-900 font-medium">
                                                {branches.find(b => String(b.branch_id) === String(formData.branch_id))?.name || '—'}
                                            </span>
                                        </div>
                                        {formData.store_name && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Store</span>
                                                <span className="text-slate-900 font-medium">{formData.store_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notice */}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 mt-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Your account will be <strong>pending verification</strong> after registration. 
                                        An admin will review and activate your account shortly.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Navigation Buttons ─────────────── */}
                        <div className="flex items-center gap-3 mt-8">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-5 h-11 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <Sparkles className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Already have account */}
                    <div className="text-center mt-8 pb-4">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
