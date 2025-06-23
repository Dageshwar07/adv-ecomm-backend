import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ProductModel from '../models/product.model.js';
import CategoryModel from '../models/category.model.js';
import ImageUpload from '../models/imageUpload.model.js';
// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

let imagesArr = [];
// ImageUpload model already imported: ✅

export async function uploadProductImages(request, response) {
  try {
    const images = request.files;
    let uploadedUrls = [];

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

      uploadedUrls.push(result.secure_url);

      // Delete local file after upload
      fs.unlinkSync(`uploads/${images[i].filename}`);
    }

    // ✅ Save to ImageUpload model
    const saved = new ImageUpload({ images: uploadedUrls });
    await saved.save();

    return response.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedUrls,
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
}

// controllers/product.controller.js


export async function createProduct(req, res) {
    try {
        // ✅ Step 1: Validate Category
        const category = await CategoryModel.findById(req.body.category);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Invalid Category ID",
            });
        }

        // ✅ Step 2: Collect images from ImageUpload collection
        const uploadedImages = await ImageUpload.find();
        let imagesArr = [];

        uploadedImages?.forEach((item) => {
            item.images?.forEach((imgUrl) => {
                imagesArr.push(imgUrl);
            });
        });
        

        if (imagesArr.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images found to create product",
            });
        }

        // ✅ Step 3: Create Product
        const product = new ProductModel({
            name: req.body.name,
            description: req.body.description,
            images: imagesArr, // fetched from ImageUpload model
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

        if (!savedProduct) {
            return res.status(500).json({
                success: false,
                message: "Product creation failed",
            });
        }

        // ✅ Clear imagesArr after successful save
        imagesArr = [];

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

// controllers/product.controller.js


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
