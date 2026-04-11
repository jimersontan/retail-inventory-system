import React, { useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import StarDisplay from './StarDisplay';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, showProduct = false, onDelete, onEdit, isAdmin = false }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(review.review_id);
            toast.success('Review deleted successfully');
            setShowDeleteConfirm(false);
        } catch (error) {
            toast.error('Failed to delete review');
        } finally {
            setIsDeleting(false);
        }
    };

    // Format date as "Dec 15, 2024"
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            {/* Header: Avatar, Name, Date */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-600">
                            {review.user?.initials || 'U'}
                        </span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                            {review.user?.name || 'Anonymous'}
                        </h4>
                        <p className="text-xs text-slate-500">
                            {formatDate(review.review_time)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete review"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            {/* Product Info (if showProduct) */}
            {showProduct && review.product && (
                <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs text-slate-600">
                        <span className="font-medium">Product:</span> {review.product.name}
                        {review.product.unique_sku && (
                            <span className="text-slate-400">
                                {' '}(SKU: {review.product.unique_sku})
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Rating */}
            <div className="mb-3">
                <StarDisplay rating={review.rating} size="sm" showCount={false} />
            </div>

            {/* Comment */}
            <p className="text-sm text-slate-700 line-clamp-3 mb-3">
                {review.comment || 'No comment provided'}
            </p>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="size-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-slate-900">
                                Delete Review
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to delete this review? This action cannot be
                            undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
