import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ProductModel from '../models/product.model.js';
import CategoryModel from '../models/category.model.js';
import { setImages,clearImages,getImages } from '../config/imageStore.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadProductImages(req, res) {
  try {
    const images = req.files;
    let uploadedUrls = [];

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images?.length; i++) {
      const result = await cloudinary.uploader.upload(images[i].path, options);
      uploadedUrls.push(result.secure_url);
      fs.unlinkSync(images[i].path); // Delete local file
    }

    setImages(uploadedUrls); // Save in memory

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedUrls,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
}

export async function createProduct(req, res) {
  try {
    const category = await CategoryModel.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Invalid Category ID",
      });
    }

    const uploadedImages = getImages();
    if (!uploadedImages || uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded for this product",
      });
    }

    const product = new ProductModel({
      name: req.body.name,
      description: req.body.description,
      images: uploadedImages, // 🔥 use images from memory
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      catId: req.body.catId,
      catName: req.body.catName,
      subcat: req.body.subCat,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
      category: req.body.category,
      thirdsubCat: req.body.thirdsubCat,
      thirdsubCatName: req.body.thirdsubCatName,
      thirdsubCatId: req.body.thirdsubCatId,
      countInStock: req.body.countInStock,
      rating: req.body.rating || 0,
      isFeatured: req.body.isFeatured || false,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight || 1,
      location: req.body.location || "All",
    });

    const savedProduct = await product.save();

    // Clear memory after success
    clearImages();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Product creation failed",
      error: error.message,
    });
  }
}

export async function getAllProducts(req, res) {
  try {
    // Step 1: Parse query params
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location; // Optional

    // Step 2: Filter query (based on location if provided)
    const filter = {};
    if (location) {
      filter.location = location;
    }

    // Step 3: Count total documents
    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Step 4: Fetch products with pagination
    const products = await ProductModel.find(filter)
      .populate('category', 'name') // Optional: populate category name
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    // Step 5: Response
    return res.status(200).json({
      success: true,
      currentPage: page,
      perPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

export async function getAllProductsByCategoryId(req, res) {
  try {
    console.log("🔥 Route hit:", req.params.categoryId);

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location;

    // ✅ Step 1: Build Filter
    const filter = {
      category: req.params.categoryId,
    };
    if (location) {
      filter.location = location;
    }

    // ✅ Step 2: Count total documents
    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // ✅ Step 3: Fetch products
    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    console.log("✅ Products found:", products.length);

    // ✅ Step 4: Send Response including totalPages
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      currentPage: page,
      perPage,
      totalPages,           // <-- ✅ included here
      totalProducts,
      products,
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

export async function getAllProductsByCategoryName(req, res) {
  try {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location;

    // ✅ Step 1: Find category by name (case-insensitive)
    const category = await CategoryModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `No category found with name "${name}"`,
      });
    }

    // ✅ Step 2: Build filter
    const filter = { category: category._id };
    if (location) {
      filter.location = location;
    }

    // ✅ Step 3: Count total
    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // ✅ Step 4: Fetch products
    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      currentPage: page,
      perPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

export async function getProductsBySubCatid(req, res) {
  try {
    const { subCatid } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location;

    const filter = { subCatid };
    if (location) {
      filter.location = location;
    }

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched by subCatid",
      currentPage: page,
      perPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products by subCatid",
      error: error.message,
    });
  }
}

export async function getProductsBySubCatName(req, res) {
  try {
    const { subcat } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location;

    const filter = {
      subcat: { $regex: new RegExp(`^${subcat}$`, "i") }
    };

    if (location) {
      filter.location = location;
    }

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched by subcat name",
      currentPage: page,
      perPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products by subcat name",
      error: error.message,
    });
  }
}

export async function getAllProductsByThirdSubCatId(req, res) {
  try {
    const { thirdsubCatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location;

    const filter = { thirdsubCatId };
    if (location) {
      filter.location = location;
    }

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched by thirdsubCatId",
      currentPage: page,
      perPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products by thirdsubCatId",
      error: error.message,
    });
  }
}

export async function getAllProductsByThirdSubCatName(req, res) {
  try {
    const { thirdsubCatName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const location = req.query.location;

    const filter = {
      thirdsubCatName: { $regex: new RegExp(`^${thirdsubCatName}$`, "i") }
    };

    if (location) filter.location = location;

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched by thirdsubCatName",
      currentPage: page,
      perPage,
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products by thirdsubCatName",
      error: error.message,
    });
  }
}

export async function filterProductsByPrice(req, res) {
  try {
    const {
      catId,
      subCatId,
      location,
      minPrice,
      maxPrice,
      page = 1,
      perPage = 10,
    } = req.query;

    const filter = {};

    if (catId) {
      filter.catId = catId;
    }

    if (subCatId) {
      filter.subCatId = subCatId; // Match your corrected schema
    }

    if (location && location !== "All") {
      filter.location = location;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Filtered products fetched successfully",
      currentPage: parseInt(page),
      perPage: parseInt(perPage),
      totalProducts,
      totalPages,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to filter products",
      error: error.message,
    });
  }
}

export async function getAllProductsByRating(req, res) {
  try {
    const {
      minRating = 0,
      maxRating = 5,
      page = 1,
      perPage = 10,
      location,
    } = req.query;

    const filter = {
      rating: {
        $gte: parseFloat(minRating),
        $lte: parseFloat(maxRating),
      },
    };

    if (location && location !== "All") {
      filter.location = location;
    }

    const totalProducts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name")
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .sort({ rating: -1 }); // High to Low rating

    return res.status(200).json({
      success: true,
      message: "Products fetched by rating",
      currentPage: parseInt(page),
      perPage: parseInt(perPage),
      totalPages,
      totalProducts,
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products by rating",
      error: error.message,
    });
  }
}

export async function getProductCount(req, res) {
  try {
    const {
      catId,
      subCatId,
      thirdsubCatId,
      location
    } = req.query;

    // Build filter object
    const filter = {};

    if (catId) {
      filter.catId = catId;
    }

    if (subCatId) {
      filter.subCatid = subCatId; // field name from your schema
    }

    if (thirdsubCatId) {
      filter.thirdsubCatId = thirdsubCatId;
    }

    if (location && location !== "All") {
      filter.location = location;
    }

    const totalProducts = await ProductModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalProducts,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to count products",
      error: error.message,
    });
  }
}

export async function getFeaturedProducts(req, res) {
  try {
    const products = await ProductModel.find({ isFeatured: true })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
}

export async function deleteProductById(req, res) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // ✅ Delete images from Cloudinary
    const images = product.images;
    for (const imgUrl of images) {
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0]; // remove .jpg/.png

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    // ✅ Delete product
    await ProductModel.findByIdAndDelete(req.params.id);

    // // ✅ Delete from MyList
    // await MyList.deleteMany({ productId: req.params.id });

    // // ✅ Delete from Cart
    // await Cart.deleteMany({ productId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
    });

  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await ProductModel.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "The product is not found",
        error: true,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      product,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to fetch product",
      details: error.message,
    });
  }
}

export async function deleteProductImage(req, res) {
  try {
    const imgUrl = req.query.img;

    if (!imgUrl) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }

    const urlParts = imgUrl.split('/');
    const fileNameWithExt = urlParts[urlParts.length - 1]; // image-name.jpg
    const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // image-name

    // Check if image is in a folder (other than default "upload")
    const folderName = urlParts[urlParts.length - 2];
    let publicId;

    if (folderName === "upload") {
      publicId = fileNameWithoutExt;
    } else {
      publicId = `${folderName}/${fileNameWithoutExt}`;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      return res.status(200).json({
        success: true,
        message: result.result === 'ok' ? "Image deleted successfully" : "Image not found or already deleted",
        result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to delete image",
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

export async function updateProduct(req, res) {
  try {
    const productId = req.params.id;

    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Optional: Validate category
    if (req.body.category) {
      const category = await CategoryModel.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ success: false, message: "Invalid Category ID" });
      }
    }

    const updatedFields = {
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      catId: req.body.catId,
      catName: req.body.catName,
      subcat: req.body.subCat,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
      category: req.body.category,
      thirdsubCat: req.body.thirdsubCat,
      thirdsubCatName: req.body.thirdsubCatName,
      thirdsubCatId: req.body.thirdsubCatId,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight,
      location: req.body.location,
      productColor: req.body.productColor,
      images: req.body.images, // If you want to update images too
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: updatedFields },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Product update failed",
      error: error.message,
    });
  }
}