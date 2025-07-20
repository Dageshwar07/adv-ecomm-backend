import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    viewCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one record per user per product
recentlyViewedSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for better query performance
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

const RecentlyViewedModel = mongoose.model('RecentlyViewed', recentlyViewedSchema);

export default RecentlyViewedModel;
