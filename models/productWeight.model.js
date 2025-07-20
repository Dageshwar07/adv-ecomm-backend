import mongoose from 'mongoose';

const productWeightSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['g', 'kg', 'lb', 'oz'],
      default: 'g',
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
productWeightSchema.index({ product: 1, weight: 1 }, { unique: true });
productWeightSchema.index({ sku: 1 });

const ProductWeightModel = mongoose.model('ProductWeight', productWeightSchema);

export default ProductWeightModel;
