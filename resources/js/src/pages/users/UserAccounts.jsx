import React, { useState, useEffect, useCallback } from 'react';
import { UserCog, Search, Plus, Edit2, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import StatusBadge from '../../components/ui/StatusBadge';

const UserAccounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', user_type: 'customer' });
    const [formLoading, setFormLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/users', { params: { search, user_type: filterType || undefined, page } });
            setUsers(res.data.data || []);
            setMeta(res.data.meta || {});
        } catch (err) {
            toast.error('Failed to load users');
        } finally { setLoading(false); }
    }, [search, filterType, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openCreate = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', password: '', phone: '', address: '', user_type: 'customer' });
        setFormErrors({});
        setShowForm(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, password: '', phone: user.phone || '', address: user.address || '', user_type: user.user_type });
        setFormErrors({});
        setShowForm(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true); setFormErrors({});
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;

            if (editingUser) {
                await api.put(`/users/${editingUser.user_id}`, payload);
                toast.success('User updated!');
            } else {
                await api.post('/users', payload);
                toast.success('User created!');
            }
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            if (err.response?.status === 422) setFormErrors(err.response.data.errors || {});
            else toast.error(err.response?.data?.message || 'Operation failed');
        } finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/users/${deleteTarget.user_id}`);
            toast.success('User deleted!');
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally { setDeleting(false); }
    };

    const getRoleBadge = (type) => {
        const map = { admin: 'bg-purple-50 text-purple-700', manager: 'bg-blue-50 text-blue-700', cashier: 'bg-emerald-50 text-emerald-700', customer: 'bg-amber-50 text-amber-700' };
        return map[type] || 'bg-slate-50 text-slate-600';
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Accounts</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage system users and their roles</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name or email…"
                            className="h-10 w-full pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                        className="h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="cashier">Cashier</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16"><UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No users found</p></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-slate-700">User</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-700">Email</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-700">Role</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-700">Phone</th>
                                <th className="text-center px-6 py-3 font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u) => (
                                <tr key={u.user_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs ${getRoleBadge(u.user_type)}`}>
                                                {u.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(u.user_type)}`}>{u.user_type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{u.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteTarget(u)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">Page {meta.current_page} of {meta.last_page} ({meta.total} users)</p>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50">Previous</button>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingUser ? 'Edit User' : 'Create User'} icon={UserCog} iconBg="bg-indigo-50" maxWidth="md"
                footer={<>
                    <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">{formLoading && <Loader2 className="w-4 h-4 animate-spin" />} {editingUser ? 'Update' : 'Create'}</button>
                </>}>
                <div className="px-6 py-4 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name[0]}</p>}</div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email[0]}</p>}</div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">{editingUser ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password[0]}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Role *</label><select value={form.user_type} onChange={e => setForm({ ...form, user_type: e.target.value })} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="admin">Admin</option><option value="manager">Manager</option><option value="cashier">Cashier</option><option value="customer">Customer</option></select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="h-11 w-full border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete User" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} confirmText="Delete User" loading={deleting} />
        </div>
    );
};

export default UserAccounts;
