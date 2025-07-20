import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    mobileImage: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    linkType: {
      type: String,
      enum: ['PRODUCT', 'CATEGORY', 'EXTERNAL', 'NONE'],
      default: 'NONE',
    },
    linkTarget: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      enum: ['TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR'],
      default: 'TOP',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    textColor: {
      type: String,
      default: '#000000',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
bannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });
bannerSchema.index({ isActive: 1 });

// Virtual for checking if banner is currently active
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now);
});

// Ensure virtuals are serialized
bannerSchema.set('toJSON', { virtuals: true });
bannerSchema.set('toObject', { virtuals: true });

const BannerModel = mongoose.model('Banner', bannerSchema);

export default BannerModel;
