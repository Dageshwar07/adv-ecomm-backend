import mongoose from 'mongoose';

const homeBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
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
    buttonText: {
      type: String,
      maxlength: 50,
      default: 'Shop Now',
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
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    textColor: {
      type: String,
      default: '#000000',
    },
    overlayColor: {
      type: String,
      default: 'rgba(0,0,0,0.3)',
    },
    textPosition: {
      type: String,
      enum: ['LEFT', 'CENTER', 'RIGHT'],
      default: 'CENTER',
    },
    animation: {
      type: String,
      enum: ['FADE', 'SLIDE', 'ZOOM', 'NONE'],
      default: 'FADE',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
homeBannerSchema.index({ isActive: 1, sortOrder: 1 });
homeBannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if banner is currently active
homeBannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now);
});

// Ensure virtuals are serialized
homeBannerSchema.set('toJSON', { virtuals: true });
homeBannerSchema.set('toObject', { virtuals: true });

const HomeBannerModel = mongoose.model('HomeBanner', homeBannerSchema);

export default HomeBannerModel;
