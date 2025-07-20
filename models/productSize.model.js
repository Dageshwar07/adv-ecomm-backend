import mongoose from 'mongoose';

const productSizeSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
productSizeSchema.index({ product: 1, size: 1 }, { unique: true });
productSizeSchema.index({ sku: 1 });

const ProductSizeModel = mongoose.model('ProductSize', productSizeSchema);

export default ProductSizeModel;
