import React, { useEffect, useState } from 'react';
import { Edit2, Lock, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useCustomerStore } from '../../store/customerStore';
import { useListingStore } from '../../store/listingStore';
import CustomerStatusBadge from '../../components/customers/CustomerStatusBadge';
import VerificationBadge from '../../components/customers/VerificationBadge';
import ListingCard from '../../components/customers/ListingCard';
import ListingModal from './ListingModal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/format';
import api from '../../api/axios';

const CustomerProfile = () => {
    const { user, fetchMe } = useAuthStore();
    const { listings, fetchListings, deleteListing } = useListingStore();
    const currentCustomer = user?.customer;
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        store_name: currentCustomer?.store_name || '',
    });

    useEffect(() => {
        fetchListings().catch(err => {
            console.error('Failed to load listings:', err);
        });
    }, [fetchListings]);

    useEffect(() => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            store_name: currentCustomer?.store_name || '',
        });
    }, [user, currentCustomer]);

    const handleProfileSave = async () => {
        try {
            await api.put('/customers/profile/update', formData);
            toast.success('Profile updated successfully');
            await fetchMe();
            setIsEditingProfile(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleListingEdit = (listing) => {
        setEditingListing(listing);
        setIsListingModalOpen(true);
    };

    const handleListingDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this listing?')) {
            try {
                await deleteListing(id);
                toast.success('Listing removed');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete listing');
            }
        }
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C';

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">My Profile</h1>
            <p className="text-sm text-slate-500 mb-8">Manage your account information</p>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Sidebar */}
                <div className="lg:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center mb-4">
                        <div className="w-24 h-24 rounded-full mx-auto bg-indigo-100 text-indigo-700 font-bold text-3xl flex items-center justify-center">
                            {initials}
                        </div>
                        <button className="text-xs text-indigo-500 hover:text-indigo-600 mt-3 font-medium">
                            Edit Photo
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mt-4">{user?.name}</h3>
                        <p className="text-slate-500 text-sm">{user?.email}</p>
                        
                        <div className="flex flex-col gap-2 mt-4">
                            <CustomerStatusBadge status={currentCustomer?.status} />
                            <VerificationBadge isVerified={currentCustomer?.is_verified} />
                        </div>

                        <p className="text-xs text-slate-400 mt-3">
                            Member since {formatDate(currentCustomer?.joined_at)}
                        </p>

                        {currentCustomer?.store_name && (
                            <div className="bg-indigo-50 rounded-xl p-3 mt-4">
                                <ShoppingBag className="size-4 text-indigo-600 mx-auto mb-1" />
                                <p className="font-medium text-indigo-700 text-sm">{currentCustomer.store_name}</p>
                            </div>
                        )}
                    </div>

                    {/* Verification Pending Alert */}
                    {currentCustomer?.status === 'pending_verification' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex gap-2">
                                <span className="text-amber-600 text-lg">⏱️</span>
                                <div className="text-sm">
                                    <p className="font-medium text-amber-700">Account Pending Verification</p>
                                    <p className="text-amber-600 text-xs mt-1">Admin will verify your account. You can still browse.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-2">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                            <button
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                            >
                                <Edit2 className="size-3" />
                                {isEditingProfile ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        {isEditingProfile ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-slate-600">Store Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.store_name}
                                            onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                                            placeholder="Leave blank if not a reseller"
                                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleProfileSave}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Full Name</p>
                                        <p className="text-sm font-medium text-slate-900">{formData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium text-slate-900">{formData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p className="text-sm font-medium text-slate-900">{formData.phone || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Address</p>
                                        <p className="text-sm font-medium text-slate-900">{formData.address || '—'}</p>
                                    </div>
                                </div>
                                {formData.store_name && (
                                    <div>
                                        <p className="text-xs text-slate-500">Store Name</p>
                                        <p className="text-sm font-medium text-slate-900">{formData.store_name}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="size-4 text-slate-900" />
                            <h3 className="text-sm font-semibold text-slate-900">Change Password</h3>
                        </div>
                        <div className="space-y-4">
                            <input type="password" placeholder="Current Password" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="password" placeholder="New Password" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="password" placeholder="Confirm New Password" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                                Update Password
                            </button>
                        </div>
                    </div>

                    {/* My Reseller Listings Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">My Reseller Listings</h3>
                            <button
                                onClick={() => {
                                    setEditingListing(null);
                                    setIsListingModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors text-xs font-medium"
                            >
                                <Plus className="size-3" />
                                List a Product
                            </button>
                        </div>

                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {listings.map(listing => (
                                    <ListingCard
                                        key={listing.seller_id}
                                        listing={listing}
                                        onEdit={handleListingEdit}
                                        onDelete={handleListingDelete}
                                        editable={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingBag className="size-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No listings yet. Start listing products to resell!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Listing Modal */}
            <ListingModal
                isOpen={isListingModalOpen}
                onClose={() => {
                    setIsListingModalOpen(false);
                    setEditingListing(null);
                }}
                editingListing={editingListing}
                onSuccess={() => {
                    setIsListingModalOpen(false);
                    setEditingListing(null);
                    fetchListings();
                }}
            />
        </div>
    );
};

export default CustomerProfile;
