import CategoryModel from '../models/category.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

let imagesArr = [];
export async function uploadImages(request, response) {
  try {
    imagesArr = [];

    const images = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images?.length; i++) {
      const result = await cloudinary.uploader.upload(
        images[i].path,
        options
      );

      imagesArr.push(result.secure_url);

      // Delete local file after upload
      fs.unlinkSync(`uploads/${images[i].filename}`);
    }

    return response.status(200).json({
      images: imagesArr[0], // return first image only
    });

  } catch (error) {
    return response.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
}

// create category
export async function createCategory(request, response) {
  try {
    let category = new CategoryModel({
      name: request.body.name,
      images: imagesArr,
      parentId: request.body.parentId,
      parentCatName: request.body.parentCatName,
    });

    if (!category) {
      return response.status(500).json({
        message: "Category not created",
        error: true,
        success: false,
      });
    }

    category = await category.save();
    imagesArr = [];

    return response.status(200).json({
      category: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}


export async function getAllCategories(req, res) {
  try {
    const categories = await CategoryModel.find();

    const categoryMap = {};

    // Step 1: Map each category with its ID and initialize children
    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootCategories = [];

    // Step 2: Organize into parent-child hierarchy
    categories.forEach((cat) => {
      if (cat.parentId) {
        if (categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    // Final response
    res.status(200).json({
      success: true,
      total: rootCategories.length,
      categories: rootCategories,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
}

export async function getCategoryCount(req, res) {
  try {
    const categoryCount = await CategoryModel.countDocuments({ parentId: null });

    res.status(200).json({
      success: true,
      categoryCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to count categories",
      error: error.message,
    });
  }
}

export async function getSubCategoryCount(req, res) {
  try {
    const subCategoryCount = await CategoryModel.countDocuments({
      parentId: { $ne: null },
    });

    return res.status(200).json({
      success: true,
      subCategoryCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to count subcategories",
      error: error.message,
    });
  }
}


// ✅ Get Category by ID
export async function getCategoryById(req, res) {
  try {
    const categoryId = req.params.id;

    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "The category with the given ID was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
}

export async function deleteImage(req, res) {
  try {
    const imgUrl = req.query.img;

    if (!imgUrl) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }

    const urlParts = imgUrl.split('/');
    const fileName = urlParts[urlParts.length - 1]; // image-abc123.jpg
    const publicIdWithExt = fileName.split('.')[0]; // image-abc123
    const folderName = urlParts[urlParts.length - 2]; // e.g., "upload" or "folder"

    // Combine folderName + fileName if using folders in Cloudinary
    const publicId = `${folderName}/${publicIdWithExt}`;

    // Delete using publicId
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Image not found or already deleted",
        result,
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Image deletion failed",
      error: error.message,
    });
  }
}


// ✅ Delete Category by ID (with images + subcategories)
export async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.id;

    // Step 1: Find the main category
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Step 2: Delete its images from Cloudinary
    for (const imgUrl of category.images) {
      const parts = imgUrl.split('/');
      const imageFile = parts[parts.length - 1]; // image-name.jpg
      const publicId = imageFile.split('.')[0]; // remove .jpg/.png
      await cloudinary.uploader.destroy(publicId);
    }

    // Step 3: Find subcategories
    const subCategories = await CategoryModel.find({ parentId: categoryId });

    for (const sub of subCategories) {
      // delete subcategory images
      for (const imgUrl of sub.images) {
        const parts = imgUrl.split('/');
        const imageFile = parts[parts.length - 1];
        const publicId = imageFile.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // delete subcategory
      await CategoryModel.findByIdAndDelete(sub._id);
    }

    // Step 4: Delete the main category
    await CategoryModel.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category and its subcategories deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
}


// ✅ Update Category by ID
export async function updateCategory(req, res) {
  try {
    const categoryId = req.params.id;

    const updatedData = {
      name: req.body.name,
      images: imagesArr.length > 0 ? imagesArr : req.body.images,
      color: req.body.color,
      parentId: req.body.parentId,
      parentCatName: req.body.parentCatName,
    };

    const category = await CategoryModel.findByIdAndUpdate(
      categoryId,
      updatedData,
      { new: true } // return updated doc
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found or update failed!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
}
