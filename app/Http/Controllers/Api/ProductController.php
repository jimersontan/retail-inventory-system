<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Branch;
use App\Models\Inventory;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'inventory']);

        if ($request->has('search') && $request->search != '') {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('unique_sku', 'like', "%{$term}%");
            });
        }

        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }
        
        $products = $query->paginate(20);
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        
        $product = DB::transaction(function () use ($validated, $request) {
            // SKU auto-generation logic
            $category = Category::findOrFail($validated['category_id']);
            $initials = strtoupper(substr($category->category_name, 0, 3));
            $random = strtoupper(Str::random(8));
            $sku = "RIS-{$initials}-{$random}";
            $validated['unique_sku'] = $sku;
            $validated['supplier_id'] = $validated['supplier_id'] ?? 1;

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $validated['image'] = $path;
            }

            $product = Product::create($validated);

            // Inventory seeding loop
            Branch::where('is_active', 1)->each(function($branch) use ($product) {
                Inventory::create([
                    'branch_id' => $branch->branch_id,
                    'product_id' => $product->product_id,
                    'quantity' => 0,
                    'min_stock' => 5, 
                    'max_stock' => 100, 
                    'last_updated' => now(),
                ]);
            });

            return $product;
        });

        $product->load(['category', 'inventory', 'reviews']);
        return response()->json(new ProductResource($product), 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'inventory.branch', 'reviews.user'])
                          ->findOrFail($id);
        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validated();
        
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }
        
        $product->update($validated);
        $product->load(['category', 'inventory']);
        
        return response()->json(new ProductResource($product));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:available,unavailable,discontinued']);
        
        $product = Product::findOrFail($id);
        $product->status = $request->status;
        $product->save();

        return response()->json([
            'message' => 'Product status updated',
            'product' => new ProductResource($product)
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->status !== 'discontinued') {
            return response()->json(['message' => 'Only discontinued products can be deleted.'], 422);
        }

        if ($product->getTotalStockAttribute() > 0) {
            return response()->json(['message' => 'Cannot delete product with existing stock.'], 422);
        }

        // Delete image on final destroy
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
