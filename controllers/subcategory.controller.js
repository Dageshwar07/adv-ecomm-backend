import SubCategoryModel from '../models/subCat.model.js';
import CategoryModel from '../models/category.model.js';
import ProductModel from '../models/product.model.js';

// Create subcategory
export const createSubCategory = async (req, res) => {
  try {
    const { name, description, category, image, sortOrder, metaTitle, metaDescription } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: 'Name and category are required',
        error: true,
        success: false,
      });
    }

    // Check if category exists
    const categoryExists = await CategoryModel.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        message: 'Category not found',
        error: true,
        success: false,
      });
    }

    // Check if subcategory with same name exists in this category
    const existingSubCategory = await SubCategoryModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category,
    });

    if (existingSubCategory) {
      return res.status(400).json({
        message: 'Subcategory with this name already exists in this category',
        error: true,
        success: false,
      });
    }

    const subCategory = new SubCategoryModel({
      name,
      description: description || '',
      category,
      image: image || '',
      sortOrder: sortOrder || 0,
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || description || '',
    });

    const savedSubCategory = await subCategory.save();

    // Update category's subcategory count
    await CategoryModel.findByIdAndUpdate(category, {
      $inc: { subCategoryCount: 1 },
    });

    const populatedSubCategory = await SubCategoryModel.findById(savedSubCategory._id)
      .populate('category', 'name');

    return res.status(201).json({
      message: 'Subcategory created successfully',
      subCategory: populatedSubCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get all subcategories
export const getAllSubCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const category = req.query.category;
    const isActive = req.query.isActive;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subCategories = await SubCategoryModel.find(query)
      .populate('category', 'name')
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await SubCategoryModel.countDocuments(query);

    return res.status(200).json({
      subCategories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubCategories: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get all subcategories error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get subcategory by ID
export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategoryModel.findById(req.params.id)
      .populate('category', 'name description');

    if (!subCategory) {
      return res.status(404).json({
        message: 'Subcategory not found',
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      subCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get subcategory error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Update subcategory
export const updateSubCategory = async (req, res) => {
  try {
    const { name, description, category, image, isActive, sortOrder, metaTitle, metaDescription } = req.body;

    const subCategory = await SubCategoryModel.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({
        message: 'Subcategory not found',
        error: true,
        success: false,
      });
    }

    // Check if category exists if being updated
    if (category) {
      const categoryExists = await CategoryModel.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          message: 'Category not found',
          error: true,
          success: false,
        });
      }
    }

    // Check for name conflicts if name is being updated
    if (name && name !== subCategory.name) {
      const existingSubCategory = await SubCategoryModel.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        category: category || subCategory.category,
        _id: { $ne: req.params.id },
      });

      if (existingSubCategory) {
        return res.status(400).json({
          message: 'Subcategory with this name already exists in this category',
          error: true,
          success: false,
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (metaTitle) updateData.metaTitle = metaTitle;
    if (metaDescription) updateData.metaDescription = metaDescription;

    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name');

    return res.status(200).json({
      message: 'Subcategory updated successfully',
      subCategory: updatedSubCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Delete subcategory
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategoryModel.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({
        message: 'Subcategory not found',
        error: true,
        success: false,
      });
    }

    // Check if subcategory has products
    const productCount = await ProductModel.countDocuments({
      subCatid: req.params.id,
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete subcategory. It has ${productCount} associated products.`,
        error: true,
        success: false,
      });
    }

    await SubCategoryModel.findByIdAndDelete(req.params.id);

    // Update category's subcategory count
    await CategoryModel.findByIdAndUpdate(subCategory.category, {
      $inc: { subCategoryCount: -1 },
    });

    return res.status(200).json({
      message: 'Subcategory deleted successfully',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get subcategories by category
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const isActive = req.query.isActive;

    let query = { category: categoryId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subCategories = await SubCategoryModel.find(query)
      .populate('category', 'name')
      .sort({ sortOrder: 1, name: 1 });

    return res.status(200).json({
      subCategories,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get subcategories by category error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
}; 