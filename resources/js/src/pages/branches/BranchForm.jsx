import React, { useState, useEffect } from 'react';
import { Building2, X, Star, Wifi, Phone, AlertCircle, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBranchStore } from '../../store/branchStore';

const BranchForm = ({ isOpen, onClose, branch = null }) => {
    const isEdit = Boolean(branch);
    const { createBranch, updateBranch, loading } = useBranchStore();

    const [formData, setFormData] = useState({
        name: '',
        type: 'main',
        address: '',
        contact: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && branch) {
            setFormData({
                name: branch.name || '',
                type: branch.type || 'main',
                address: branch.address || '',
                contact: branch.contact || ''
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                type: 'main',
                address: '',
                contact: ''
            });
        }
        setErrors({});
    }, [isOpen, branch]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Basic frontend val
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Branch name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (isEdit) {
                await updateBranch(branch.branch_id, formData);
                toast.success('Branch updated successfully');
            } else {
                await createBranch(formData);
                toast.success('Branch created successfully');
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                
                {/* MODAL HEADER */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Building2 className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                {isEdit ? 'Edit Branch' : 'Add New Branch'}
                            </p>
                            <p className="text-sm text-slate-500">
                                Fill in the branch details below
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* MODAL BODY */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-6 space-y-5 bg-white">
                        
                        {/* Name Field */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Branch Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Main Branch - Quezon City"
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.name[0] || errors.name}
                                </p>
                            )}
                        </div>

                        {/* Type Field */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Branch Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3 mt-1">
                                {/* Main Option */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'main'})}
                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-left w-full ${
                                        formData.type === 'main' 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <Star className={`w-6 h-6 mb-2 ${formData.type === 'main' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <p className={`font-medium text-sm ${formData.type === 'main' ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        Main Branch
                                    </p>
                                    <p className={`text-xs ${formData.type === 'main' ? 'text-indigo-500' : 'text-slate-400'}`}>
                                        Primary store
                                    </p>
                                </button>
                                
                                {/* Satellite Option */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'satellite'})}
                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-left w-full ${
                                        formData.type === 'satellite' 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <Wifi className={`w-6 h-6 mb-2 ${formData.type === 'satellite' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <p className={`font-medium text-sm ${formData.type === 'satellite' ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        Satellite Branch
                                    </p>
                                    <p className={`text-xs ${formData.type === 'satellite' ? 'text-indigo-500' : 'text-slate-400'}`}>
                                        Secondary location
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Address Field */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Full branch address"
                                className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                            {errors.address && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.address[0] || errors.address}
                                </p>
                            )}
                            <p className="text-xs text-slate-400 text-right mt-1">
                                {formData.address.length} characters
                            </p>
                        </div>

                        {/* Contact Field */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                    placeholder="+63 XXX XXX XXXX"
                                    className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            {errors.contact && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.contact[0] || errors.contact}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* MODAL FOOTER */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    {isEdit ? 'Update Branch' : 'Save Branch'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;
