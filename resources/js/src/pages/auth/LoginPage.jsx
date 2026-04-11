import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingCart, Package, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Shield, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

/* Quick-login test accounts */
const QUICK_ACCOUNTS = [
    { label: 'Admin',    email: 'admin@ris.com',    password: 'admin123',    color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
    { label: 'Manager',  email: 'manager@ris.com',  password: 'manager123',  color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
    { label: 'Cashier',  email: 'cashier@ris.com',  password: 'cashier123',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
    { label: 'Customer', email: 'customer@ris.com', password: 'customer123', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
];

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();

    const handleLogin = async (loginEmail, loginPassword) => {
        setError('');
        setIsLoading(true);

        try {
            const user = await login(loginEmail, loginPassword);
            toast.success('Login successful!');

            switch (user.user_type?.toLowerCase()) {
                case 'admin':
                case 'manager':
                    navigate('/dashboard');
                    break;
                case 'cashier':
                    navigate('/dashboard');
                    break;
                case 'customer':
                    navigate('/dashboard');
                    break;
                default:
                    navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials or server error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    const handleQuickLogin = async (account) => {
        setEmail(account.email);
        setPassword(account.password);
        await handleLogin(account.email, account.password);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* LEFT PANEL — Branding */}
            <div className="hidden md:flex w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 flex-col items-center justify-center px-12 relative">
                {/* Decorative circles */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute bottom-32 right-8 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/10">
                        <ShoppingCart className="text-white size-8" />
                    </div>

                    <h1 className="text-white text-3xl font-bold mt-6">
                        Retail Inventory System
                    </h1>

                    <p className="text-white/50 text-sm max-w-xs leading-relaxed mt-3">
                        Manage your branches, stock, and sales in one place.
                    </p>

                    <div className="mt-10 space-y-4 text-left">
                        {[
                            'Multi-branch inventory tracking',
                            'Real-time stock movements',
                            'Role-based access control',
                            'Purchase order management',
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="text-indigo-300 size-5 shrink-0" />
                                <span className="text-white/80 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 text-white/20 text-xs">
                    &copy; 2024 RIS &middot; IT 380 Database Systems Project
                </div>
            </div>

            {/* RIGHT PANEL — Login Form */}
            <div className="flex-1 flex items-center justify-center bg-white relative">
                <div className="w-full max-w-sm px-8 py-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Package className="text-white w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">RIS</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8">Welcome back</h2>
                    <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to your RIS account</p>

                    {/* Quick Login Pills */}
                    <div className="mb-6">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-medium text-slate-500">Quick Login</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {QUICK_ACCOUNTS.map((account) => (
                                <button
                                    key={account.label}
                                    type="button"
                                    onClick={() => handleQuickLogin(account)}
                                    disabled={isLoading}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${account.color} disabled:opacity-50`}
                                >
                                    {account.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or sign in manually</span></div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@company.com"
                                    className="pl-10 h-11 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-11 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer size-4 bg-transparent border-none p-0 flex items-center justify-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                <AlertCircle className="text-red-500 size-4 flex-shrink-0" />
                                <span className="text-red-700 text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full h-11 flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors
                                ${isLoading
                                    ? 'bg-indigo-600 opacity-70 cursor-not-allowed text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign in</span>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-1 mt-6">
                        <Shield className="text-slate-300 size-3" />
                        <span className="text-xs text-slate-400">Role-based access control</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
