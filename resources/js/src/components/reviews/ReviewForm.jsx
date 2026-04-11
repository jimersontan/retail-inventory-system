import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, AlertCircle, Loader } from 'lucide-react';
import StarPicker from './StarPicker';
import StarDisplay from './StarDisplay';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, existingReview = null, onSuccess, onCancel }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        rating: existingReview?.rating || 0,
        comment: existingReview?.comment || '',
    });

    const characterLimit = 1000;
    const characterCount = formData.comment.length;

    const handleRatingChange = (newRating) => {
        setFormData((prev) => ({
            ...prev,
            rating: newRating,
        }));
    };

    const handleCommentChange = (e) => {
        const text = e.target.value;
        if (text.length <= characterLimit) {
            setFormData((prev) => ({
                ...prev,
                comment: text,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            if (existingReview && isEditing) {
                // Update existing review
                await fetch(`/api/reviews/${existingReview.review_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content'),
                    },
                    body: JSON.stringify({
                        rating: formData.rating,
                        comment: formData.comment,
                    }),
                });
                toast.success('Review updated successfully');
            } else {
                // Create new review
                await fetch(`/api/products/${productId}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content'),
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        rating: formData.rating,
                        comment: formData.comment,
                    }),
                });
                toast.success('Review submitted successfully');
            }

            setIsEditing(false);
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to save review: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await fetch(`/api/reviews/${existingReview.review_id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
            });
            toast.success('Review deleted successfully');
            setShowDeleteConfirm(false);
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to delete review: ' + error.message);
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

    // EXISTING REVIEW VIEW
    if (existingReview && !isEditing) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <p className="text-xs text-amber-700 font-medium mb-2">
                            Your Review
                        </p>
                        <StarDisplay rating={existingReview.rating} size="sm" showCount={false} />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-700 bg-white border border-amber-300 rounded hover:bg-amber-100 transition-colors"
                            title="Edit your review"
                        >
                            <Edit2 className="size-3" />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                            title="Delete your review"
                        >
                            <Trash2 className="size-3" />
                            Delete
                        </button>
                    </div>
                </div>
                <p className="text-sm text-amber-900 line-clamp-4">
                    {existingReview.comment || 'No comment'}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                    {formatDate(existingReview.review_time)}
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
                                Are you sure you want to delete your review? This action cannot
                                be undone.
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
    }

    // FORM VIEW (NEW OR EDITING)
    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {isEditing ? 'Edit Your Review' : 'Share Your Review'}
            </h3>

            {/* Star Picker */}
            <div className="mb-4">
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                    Rating
                </label>
                <StarPicker value={formData.rating} onChange={handleRatingChange} />
            </div>

            {/* Comment Textarea */}
            <div className="mb-4">
                <label htmlFor="comment" className="text-xs font-medium text-slate-600 mb-2 block">
                    Your Comment
                </label>
                <textarea
                    id="comment"
                    value={formData.comment}
                    onChange={handleCommentChange}
                    placeholder="Share your thoughts about this product..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-sm"
                />
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500">
                        {characterCount} / {characterLimit} characters
                    </p>
                    {characterCount >= characterLimit * 0.9 && (
                        <p className="text-xs text-amber-600 font-medium">
                            Approaching limit
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                {isEditing && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({
                                rating: existingReview?.rating || 0,
                                comment: existingReview?.comment || '',
                            });
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || formData.rating === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader className="size-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        isEditing ? 'Update Review' : 'Submit Review'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
