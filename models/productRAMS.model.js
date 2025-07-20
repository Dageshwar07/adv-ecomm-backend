import mongoose from 'mongoose';

const productRAMSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    ram: {
      type: String,
      required: true,
      trim: true,
    },
    storage: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
productRAMSchema.index({ product: 1, ram: 1 }, { unique: true });
productRAMSchema.index({ sku: 1 });

const ProductRAMSModel = mongoose.model('ProductRAMS', productRAMSchema);

export default ProductRAMSModel;
