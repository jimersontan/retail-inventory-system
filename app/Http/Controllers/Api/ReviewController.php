<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Requests\Review\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Product;

class ReviewController extends Controller
{
    /**
     * Get all reviews (admin/manager only)
     * With filtering: product_id, rating, date range, search
     * Returns aggregate stats: avg_rating, total_count, five_star, low_star
     */
    public function index()
    {
        $query = Review::with('user', 'product');
        
        // Filter by user
        $user = auth()->user();
        if ($user && $user->user_type === 'customer') {
            $query->where('user_id', $user->user_id);
        } elseif (request('user_id')) {
            $query->where('user_id', request('user_id'));
        }
        
        // Filter by product
        if (request('product_id')) {
            $query->where('product_id', request('product_id'));
        }
        
        // Filter by rating
        if (request('rating')) {
            $query->where('rating', request('rating'));
        }
        
        // Filter by date range
        if (request('from_date')) {
            $query->where('review_date', '>=', request('from_date'));
        }
        if (request('to_date')) {
            $query->where('review_date', '<=', request('to_date'));
        }
        
        // Search by reviewer name or product name
        if (request('search')) {
            $search = request('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        
        $reviews = $query->orderBy('review_date', 'desc')->paginate(15);
        
        // Calculate aggregate stats
        $stats = [
            'avg_rating' => round(Review::avg('rating') ?? 0, 2),
            'total_count' => Review::count(),
            'five_star' => Review::where('rating', 5)->count(),
            'low_star' => Review::whereIn('rating', [1, 2])->count(),
        ];
        
        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'stats' => $stats,
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
                'per_page' => $reviews->perPage(),
            ],
        ]);
    }

    /**
     * Get reviews for a specific product (public)
     * Returns limited paginated results (10 per page)
     */
    public function indexByProduct($productId)
    {
        $product = Product::find($productId);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        
        $reviews = Review::where('product_id', $productId)
            ->with('user')
            ->orderBy('review_date', 'desc')
            ->paginate(10);
        
        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
                'per_page' => $reviews->perPage(),
            ],
        ]);
    }

    /**
     * Create a new review (customer only)
     * Ensures unique constraint: one review per user per product
     * Inline comment: UNIQUE(user_id, product_id) constraint checked before create
     */
    public function store(StoreReviewRequest $req, $productId = null)
    {
        $userId = auth()->id();
        $productId = $productId ?? $req->product_id;
        
        if (!$productId) {
            return response()->json(['message' => 'Product ID is required.'], 422);
        }

        // Check unique constraint: one review per user per product
        $exists = Review::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();
        
        if ($exists) {
            return response()->json(
                ['message' => 'You have already reviewed this product.'],
                422
            );
        }
        
        $review = Review::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'rating' => $req->rating,
            'comment' => $req->comment ?? null,
            'review_date' => now(),
        ]);
        
        return response()->json(
            new ReviewResource($review->load('user', 'product')),
            201
        );
    }

    /**
     * Show single review details
     */
    public function show($id)
    {
        $review = Review::with('user', 'product')->find($id);
        
        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }
        
        return response()->json(new ReviewResource($review));
    }

    /**
     * Update a review (owner only)
     * Inline comment: Ownership guard ensures only the review author can update
     */
    public function update(UpdateReviewRequest $req, $id)
    {
        $review = Review::find($id);
        
        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }
        
        // Ownership check: only the review author can update
        if ($review->user_id !== auth()->id()) {
            return response()->json(
                ['message' => 'You can only edit your own review.'],
                403
            );
        }
        
        $review->update([
            'rating' => $req->rating,
            'comment' => $req->comment ?? null,
        ]);
        
        return response()->json(new ReviewResource($review->load('user', 'product')));
    }

    /**
     * Delete a review (admin or owner)
     * Inline comment: Access control allows admin/manager to delete any,
     * customer can only delete their own reviews
     */
    public function destroy($id)
    {
        $review = Review::find($id);
        
        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }
        
        $user = auth()->user();
        $isAdmin = in_array($user->user_type, ['admin', 'manager']);
        $isOwner = $review->user_id === $user->user_id;
        
        // Delete allowed: admin/manager OR owner
        if (!$isAdmin && !$isOwner) {
            return response()->json(
                ['message' => 'You can only delete your own review.'],
                403
            );
        }
        
        $review->delete();
        
        return response()->json(['message' => 'Review deleted successfully']);
    }
}
