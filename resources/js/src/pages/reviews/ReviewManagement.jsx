import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import ReviewCard from '../../components/reviews/ReviewCard';
import RatingDistribution from '../../components/reviews/RatingDistribution';
import StarDisplay from '../../components/reviews/StarDisplay';
import { useReviewStore } from '../../store/reviewStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ReviewManagement = () => {
    const { user } = useAuthStore();
    const isCustomer = user?.user_type === 'customer';
    const {
        reviews,
        stats,
        loading,
        pagination,
        fetchReviews,
        deleteReview,
    } = useReviewStore();

    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [filters, setFilters] = useState({
        search: '',
        rating: '',
        product: '',
        dateFrom: '',
        dateTo: '',
    });
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Fetch reviews on mount and when filters change
    useEffect(() => {
        fetchReviews({
            search: filters.search || undefined,
            product_id: filters.product || undefined,
            rating: filters.rating || undefined,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
        });
    }, [filters]);

    // Fetch unique products for filter dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data.data || []);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            rating: '',
            product: '',
            dateFrom: '',
            dateTo: '',
        });
    };

    const handlePageChange = (page) => {
        fetchReviews({
            search: filters.search || undefined,
            product_id: filters.product || undefined,
            rating: filters.rating || undefined,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
            page: page,
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Stats Cards
    const StatCard = ({ label, value, subtext, icon: Icon }) => (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    {label}
                </h3>
                {Icon && <Icon className="size-4 text-slate-400" />}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {isCustomer ? 'My Reviews' : 'Review Management'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        {isCustomer 
                            ? 'Manage your product reviews and feedback' 
                            : 'Monitor and manage all customer reviews across your products'}
                    </p>
                </div>

                {/* Stats Grid */}
                {!isCustomer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            label="Total Reviews"
                            value={stats.total_count || 0}
                            subtext="All time"
                        />
                        <StatCard
                            label="Average Rating"
                            value={
                                stats.avg_rating
                                    ? (Math.round(stats.avg_rating * 10) / 10).toFixed(1)
                                    : '0'
                            }
                            subtext="Out of 5 stars"
                        />
                        <StatCard label="5-Star Reviews" value={stats.five_star || 0} />
                        <StatCard
                            label="Low Reviews"
                            value={(stats.low_star || 0)}
                            subtext="1-2 stars"
                        />
                    </div>
                )}

                {/* Rating Distribution */}
                <div className="mb-6">
                    <RatingDistribution
                        distribution={{
                            5: stats.five_star || 0,
                            4: stats.rating_4 || 0,
                            3: stats.rating_3 || 0,
                            2: stats.rating_2 || 0,
                            1: stats.low_star || 0,
                        }}
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="size-4 text-slate-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>

                        {/* Rating Filter */}
                        <select
                            value={filters.rating}
                            onChange={(e) => handleFilterChange('rating', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                            <option value="3">⭐⭐⭐ 3 Stars</option>
                            <option value="2">⭐⭐ 2 Stars</option>
                            <option value="1">⭐ 1 Star</option>
                        </select>

                        {/* Product Filter */}
                        <select
                            value={filters.product}
                            onChange={(e) => handleFilterChange('product', e.target.value)}
                            disabled={loadingProducts || products.length === 0}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm disabled:opacity-50"
                        >
                            <option value="">All Products</option>
                            {products.map((product) => (
                                <option key={product.product_id} value={product.product_id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>

                        {/* Date From */}
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                        />

                        {/* Date To */}
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                        />
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* View Mode Toggle & Results */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">
                        Showing {reviews.length} review
                        {reviews.length !== 1 ? 's' : ''}
                        {pagination?.total && ` of ${pagination.total}`}
                    </p>
                    <div className="flex gap-2 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Table view"
                        >
                            <List className="size-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded transition-colors ${
                                viewMode === 'card'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Card view"
                        >
                            <Grid className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader className="size-8 text-amber-500 animate-spin mb-2" />
                        <p className="text-slate-600">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                        <p className="text-slate-500">No reviews found matching your filters</p>
                    </div>
                ) : viewMode === 'table' ? (
                    /* Table View */
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Reviewer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Review
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {reviews.map((review) => (
                                        <tr
                                            key={review.review_id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-amber-600">
                                                            {review.user?.initials || 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-slate-900">
                                                        {review.user?.name || 'Anonymous'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {review.product?.name || 'Unknown'}
                                                {review.product?.unique_sku && (
                                                    <div className="text-xs text-slate-500">
                                                        {review.product.unique_sku}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <StarDisplay
                                                    rating={review.rating}
                                                    size="sm"
                                                    showCount={false}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                                                <p className="truncate">
                                                    {review.comment || 'No comment'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {formatDate(review.review_time)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => deleteReview(review.review_id)}
                                                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.review_id}
                                review={review}
                                showProduct={true}
                                onDelete={deleteReview}
                                isAdmin={true}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6 bg-white rounded-lg border border-slate-200 p-4">
                        <p className="text-sm text-slate-600">
                            Page {pagination.current_page} of {pagination.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={!pagination.prev_page_url}
                                className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={!pagination.next_page_url}
                                className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Next
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewManagement;
