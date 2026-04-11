import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Package, LayoutDashboard, BarChart3, Users, Building2,
    Tag, Warehouse, ShoppingCart, CreditCard, ClipboardList,
    UserCog, Shield, LogOut, Lock, Star, User
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

/* ── role-based nav config ─────────────────────────────── */
const navConfig = {
    admin: [
        { section: 'MAIN', items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { label: 'Reports', icon: BarChart3, path: '/reports' },
        ]},
        { section: 'MANAGEMENT', items: [
            { label: 'Employees', icon: Users, path: '/employees' },
            { label: 'Branches', icon: Building2, path: '/branches' },
            { label: 'Products', icon: Package, path: '/products' },
            { label: 'Categories', icon: Tag, path: '/categories' },
            { label: 'Inventory', icon: Warehouse, path: '/inventory' },
            { label: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
        ]},
        { section: 'SALES', items: [
            { label: 'Sales / POS', icon: CreditCard, path: '/pos' },
            { label: 'Orders', icon: ClipboardList, path: '/orders/manage' },
            { label: 'Customers', icon: Users, path: '/customers' },
        ]},
        { section: 'SYSTEM', items: [
            { label: 'User Accounts', icon: UserCog, path: '/users' },
            { label: 'Roles & Permissions', icon: Shield, path: '/roles' },
        ]},
    ],
    manager: [
        { section: 'MAIN', items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { label: 'Reports', icon: BarChart3, path: '/reports' },
        ]},
        { section: 'MANAGEMENT', items: [
            { label: 'Products', icon: Package, path: '/products' },
            { label: 'Inventory', icon: Warehouse, path: '/inventory' },
            { label: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
        ]},
        { section: 'TEAM', items: [
            { label: 'Employees', icon: Users, path: '/employees' },
        ]},
        { section: 'SALES', items: [
            { label: 'Sales / POS', icon: CreditCard, path: '/pos' },
        ]},
        /* Locked items — display only, no navigation */
        { section: 'LOCKED', locked: true, items: [
            { label: 'Branches', icon: Building2 },
            { label: 'User Accounts', icon: UserCog },
            { label: 'Roles & Permissions', icon: Shield },
        ]},
    ],
    cashier: [
        { section: 'MAIN', items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        ]},
        { section: 'SALES', items: [
            { label: 'POS / Sales', icon: CreditCard, path: '/pos' },
        ]},
        { section: 'CATALOG', items: [
            { label: 'Products', icon: Package, path: '/products' },
        ]},
        { section: 'LOCKED', locked: true, items: [
            { label: 'Inventory', icon: Warehouse },
            { label: 'Employees', icon: Users },
            { label: 'Branches', icon: Building2 },
            { label: 'Purchase Orders', icon: ShoppingCart },
        ]},
    ],
    customer: [
        { section: 'STORE', items: [
            { label: 'My Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { label: 'Shop Products', icon: Package, path: '/shop' },
        ]},
        { section: 'MY ACCOUNT', items: [
            { label: 'My Orders', icon: ClipboardList, path: '/my-orders' },
            { label: 'My Reviews', icon: Star, path: '/my-reviews' },
            { label: 'My Profile', icon: User, path: '/profile' },
        ]},
        { section: 'LOCKED', locked: true, items: [
            { label: 'Inventory', icon: Warehouse },
            { label: 'Sales', icon: CreditCard },
            { label: 'Branches', icon: Building2 },
        ]},
    ],
};

/* ── role color helpers ────────────────────────────────── */
const getRoleColor = (r) => {
    const map = {
        admin: 'bg-purple-100 text-purple-700',
        manager: 'bg-blue-100 text-blue-700',
        cashier: 'bg-emerald-100 text-emerald-700',
        customer: 'bg-amber-100 text-amber-700',
    };
    return map[r] || 'bg-slate-100 text-slate-700';
};

const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
};

/* ── Sidebar component ─────────────────────────────────── */
const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const role = (user?.user_type || 'customer').toLowerCase();
    const sections = navConfig[role] || navConfig.customer;

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile overlay */}
            <div 
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-100 flex flex-col z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                {/* Logo */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Package className="text-white w-4 h-4" />
                </div>
                <div>
                    <div className="text-base font-bold text-slate-900 leading-none">RIS</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Retail Inventory</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="mb-4 last:mb-0">
                        <div className="px-2 mb-1 mt-3 first:mt-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {section.section}
                        </div>
                        <ul className="space-y-0.5 mt-1">
                            {section.items.map((item, iIdx) => {
                                const Icon = item.icon;

                                /* Locked items — not clickable */
                                if (section.locked) {
                                    return (
                                        <li key={iIdx}>
                                            <div
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 opacity-40 cursor-not-allowed"
                                                title="You don't have permission to access this module"
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="flex-1">{item.label}</span>
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        </li>
                                    );
                                }

                                /* Active nav links */
                                return (
                                    <li key={iIdx}>
                                        <NavLink
                                            to={item.path}
                                            onClick={() => setIsOpen && setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                                                    isActive
                                                        ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 rounded-l-none'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`
                                            }
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.label}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* User Card */}
            <div className="px-3 py-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${getRoleColor(role)}`}>
                            {getInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</div>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize mt-0.5 ${getRoleColor(role)}`}>
                                {role}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-red-500 transition-colors py-1.5 rounded-lg hover:bg-white"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
