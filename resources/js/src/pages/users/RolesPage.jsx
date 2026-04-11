import React, { useState, useEffect } from 'react';
import { Shield, Loader2, ChevronRight, Check, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const PERMISSION_GROUPS = {
    'User Management': ['manage_users', 'manage_roles'],
    'Branch Management': ['manage_branches'],
    'Employee Management': ['manage_employees', 'view_employees'],
    'Product & Inventory': ['manage_products', 'manage_categories', 'manage_inventory', 'manage_po'],
    'Sales & Orders': ['manage_sales', 'create_sales', 'manage_orders'],
    'Customer Management': ['manage_customers'],
    'Reporting': ['view_reports'],
    'Financial': ['view_cost_price', 'view_salary'],
    'Product Access': ['view_products', 'view_inventory'],
};

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRole, setExpandedRole] = useState(null);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const res = await api.get('/roles');
                setRoles(res.data.data || res.data || []);
            } catch (err) {
                toast.error('Failed to load roles');
            } finally { setLoading(false); }
        };
        loadRoles();
    }, []);

    const getRoleColor = (name) => {
        const map = {
            admin: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100' },
            manager: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100' },
            cashier: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100' },
        };
        return map[name?.toLowerCase()] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'bg-slate-100' };
    };

    const parsePermissions = (perms) => {
        if (!perms) return [];
        if (Array.isArray(perms)) return perms;
        try { return JSON.parse(perms); } catch { return []; }
    };

    const hasPermission = (perms, permission) => {
        const list = parsePermissions(perms);
        return list.includes('all') || list.includes(permission);
    };

    if (loading) {
        return (<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>);
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
                <p className="text-sm text-slate-500 mt-0.5">View role definitions and their associated permissions</p>
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="text-sm text-indigo-700">
                    Roles are system-defined and cannot be modified through the UI. Contact your system administrator for role changes.
                </p>
            </div>

            {/* Roles Grid */}
            <div className="space-y-4">
                {roles.map((role) => {
                    const color = getRoleColor(role.role_name);
                    const permissions = parsePermissions(role.permissions);
                    const isExpanded = expandedRole === role.role_id;
                    const isAllAccess = permissions.includes('all');

                    return (
                        <div key={role.role_id} className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all ${isExpanded ? 'shadow-sm' : ''}`}>
                            {/* Role Header */}
                            <div
                                onClick={() => setExpandedRole(isExpanded ? null : role.role_id)}
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.icon}`}>
                                        <Shield className={`w-6 h-6 ${color.text}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 capitalize">{role.role_name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {isAllAccess ? 'Full system access' : `${permissions.length} permissions`}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>

                            {/* Expanded Permission Matrix */}
                            {isExpanded && (
                                <div className="px-5 pb-5 border-t border-slate-100">
                                    {isAllAccess && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mt-4 mb-4 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-700">This role has full system access (all permissions)</span>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-4">
                                        {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                                            <div key={group}>
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{group}</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {perms.map((perm) => {
                                                        const has = hasPermission(role.permissions, perm);
                                                        return (
                                                            <div key={perm} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${has ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200 opacity-50'}`}>
                                                                {has ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                                                <span className={`capitalize text-xs ${has ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                                                                    {perm.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RolesPage;
