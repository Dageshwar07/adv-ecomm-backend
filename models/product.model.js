import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    catName: {
      type: String,
      default: "",
    },
    catId: {
      type: String,
      default: "",
    },
    subCatid: {
      type: String,
      default: "",
    },
    subcat: {
      type: String,
      default: "",
    },
    thirdsubCat: {
      type: String,
      default: "",
    },
    thirdsubCatId: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    thirdsubCatName: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    productRam: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "All",
    },
    productColor: {
      type: String,
      default: "",
    },
  
    countInStock: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      required: true,
    },
    productWeight: {
      type: Number,
      default: 1,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
