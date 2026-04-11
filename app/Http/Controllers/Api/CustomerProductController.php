<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerProduct\StoreListingRequest;
use App\Http\Resources\CustomerProductResource;
use App\Models\Customer;
use App\Models\CustomerProduct;
use Illuminate\Support\Facades\DB;

class CustomerProductController extends Controller
{
    /**
     * List listings
     * Admin: all listings
     * Customer: own listings only
     */
    public function index()
    {
        $user = auth()->user();
        
        $query = CustomerProduct::with('product');
        
        // Filter for customers to see only their own listings
        if ($user->user_type === 'customer') {
            $customer = Customer::where('user_id', $user->user_id)->first();
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }
            $query->where('seller_id', $customer->customer_id);
        }
        
        $listings = $query->paginate(12);
        
        return response()->json([
            'data' => CustomerProductResource::collection($listings),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'total' => $listings->total(),
                'per_page' => $listings->perPage(),
            ],
        ]);
    }

    /**
     * Create or update listing (uses updateOrCreate for unique constraint)
     * Unique constraint: UNIQUE(seller_id, product_id)
     * Note: using updateOrCreate to handle duplicate listings gracefully
     */
    public function store(StoreListingRequest $req)
    {
        $user = auth()->user();
        
        // Only customers can list products
        if ($user->user_type !== 'customer') {
            return response()->json(['message' => 'Only customers can list products'], 403);
        }
        
        $customer = Customer::where('user_id', $user->user_id)->first();
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
        
        $data = $req->validated();
        
        // updateOrCreate: if listing exists, update; otherwise create
        // This respects the UNIQUE(seller_id, product_id) constraint
        $listing = CustomerProduct::updateOrCreate(
            [
                'seller_id' => $customer->customer_id,
                'product_id' => $data['product_id'],
            ],
            [
                'stock_offset' => $data['stock_offset'],
                'stock_qty' => $data['stock_qty'],
                'is_available' => $data['is_available'] ?? true,
                'listed_at' => now(),
                'updated_at' => now(),
            ]
        );
        
        return response()->json(
            new CustomerProductResource($listing->load('product')),
            201
        );
    }

    /**
     * Update listing (customer own listing only)
     */
    public function update($id, StoreListingRequest $req)
    {
        $user = auth()->user();
        
        if ($user->user_type !== 'customer') {
            return response()->json(['message' => 'Only customers can update listings'], 403);
        }
        
        $listing = CustomerProduct::find($id);
        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }
        
        $customer = Customer::where('user_id', $user->user_id)->first();
        if (!$customer || $listing->seller_id !== $customer->customer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $data = $req->validated();
        
        $listing->update([
            'stock_offset' => $data['stock_offset'] ?? $listing->stock_offset,
            'stock_qty' => $data['stock_qty'] ?? $listing->stock_qty,
            'is_available' => $data['is_available'] ?? $listing->is_available,
            'updated_at' => now(),
        ]);
        
        return response()->json(new CustomerProductResource($listing->load('product')));
    }

    /**
     * Toggle availability of listing (customer own listing only)
     */
    public function toggleAvailable($id)
    {
        $user = auth()->user();
        
        if ($user->user_type !== 'customer') {
            return response()->json(['message' => 'Only customers can toggle listings'], 403);
        }
        
        $listing = CustomerProduct::find($id);
        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }
        
        $customer = Customer::where('user_id', $user->user_id)->first();
        if (!$customer || $listing->seller_id !== $customer->customer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $listing->is_available = !$listing->is_available;
        $listing->updated_at = now();
        $listing->save();
        
        return response()->json(new CustomerProductResource($listing->load('product')));
    }

    /**
     * Delete listing (customer own listing only)
     */
    public function destroy($id)
    {
        $user = auth()->user();
        
        if ($user->user_type !== 'customer') {
            return response()->json(['message' => 'Only customers can delete listings'], 403);
        }
        
        $listing = CustomerProduct::find($id);
        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }
        
        $customer = Customer::where('user_id', $user->user_id)->first();
        if (!$customer || $listing->seller_id !== $customer->customer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $listing->delete();
        
        return response()->json(['message' => 'Listing deleted successfully']);
    }
}
