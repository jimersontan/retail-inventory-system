<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        // Simple distinct check for the "create" modal validation
        if ($request->has('check_name')) {
            $exists = Category::where('category_name', $request->check_name)->exists();
            return response()->json(['available' => !$exists]);
        }

        $query = Category::with(['parent', 'children']);

        if ($request->has('search') && $request->search != '') {
            $query->where('category_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active') && $request->is_active !== 'all') {
            $query->where('is_active', $request->is_active === 'active' || $request->is_active === '1');
        }

        $categories = $query->get();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());
        $category->load(['parent', 'children']);
        return response()->json(new CategoryResource($category), 201);
    }

    public function show($id)
    {
        $category = Category::with(['parent', 'children'])->findOrFail($id);
        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        
        if ($request->parent_category_id == $id) {
            return response()->json(['message' => 'Category cannot be its own parent.'], 422);
        }

        $category->update($request->validated());
        $category->load(['parent', 'children']);
        return response()->json(new CategoryResource($category));
    }

    public function toggleActive($id)
    {
        $category = Category::findOrFail($id);
        
        if ($category->is_active) {
            // Category deactivation guard check
            if ($category->products()->where('status', 'available')->count() > 0) {
                return response()->json([
                    'message' => 'Cannot deactivate category. It has available products.'
                ], 422);
            }
        }

        $category->is_active = !$category->is_active;
        $category->save();

        return response()->json([
            'message' => 'Status updated successfully.',
            'category' => new CategoryResource($category)
        ]);
    }
}
