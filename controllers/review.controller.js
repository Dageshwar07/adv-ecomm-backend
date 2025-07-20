import ReviewModel from '../models/productReviews.model.js';
import ProductModel from '../models/product.model.js';
import UserModel from '../models/user.model.js';

// Create review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        message: 'Product ID, rating, title, and comment are required',
        error: true,
        success: false,
      });
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
        error: true,
        success: false,
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await ReviewModel.findOne({
      user: req.userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this product',
        error: true,
        success: false,
      });
    }

    // Check if user has purchased this product (optional verification)
    const user = await UserModel.findById(req.userId).populate('order_history');
    const hasPurchased = user.order_history.some(order => 
      order.orderItems.some(item => item.product.toString() === productId)
    );

    const review = new ReviewModel({
      user: req.userId,
      product: productId,
      rating,
      title,
      comment,
      images: images || [],
      verified: hasPurchased,
    });

    const savedReview = await review.save();

    // Update product rating
    const productReviews = await ReviewModel.find({ 
      product: productId, 
      status: 'APPROVED' 
    });
    
    const avgRating = productReviews.reduce((acc, rev) => acc + rev.rating, 0) / productReviews.length;
    
    await ProductModel.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
    });

    const populatedReview = await ReviewModel.findById(savedReview._id)
      .populate('user', 'name avatar')
      .populate('product', 'name images');

    return res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rating = parseInt(req.query.rating);
    const sort = req.query.sort || 'newest'; // newest, oldest, rating
    const skip = (page - 1) * limit;

    let query = { product: productId, status: 'APPROVED' };
    if (rating) query.rating = rating;

    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'rating':
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const reviews = await ReviewModel.find(query)
      .populate('user', 'name avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await ReviewModel.countDocuments(query);

    // Get rating distribution
    const ratingStats = await ReviewModel.aggregate([
      { $match: { product: productId, status: 'APPROVED' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      ratingStats,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await ReviewModel.find({ user: req.userId })
      .populate('product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReviewModel.countDocuments({ user: req.userId });

    return res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const { reviewId } = req.params;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: true,
        success: false,
      });
    }

    if (review.user.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Not authorized to update this review',
        error: true,
        success: false,
      });
    }

    const updateData = {};
    if (rating) updateData.rating = rating;
    if (title) updateData.title = title;
    if (comment) updateData.comment = comment;
    if (images) updateData.images = images;

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate('user', 'name avatar')
     .populate('product', 'name images');

    // Update product rating if rating changed
    if (rating) {
      const productReviews = await ReviewModel.find({ 
        product: review.product, 
        status: 'APPROVED' 
      });
      
      const avgRating = productReviews.reduce((acc, rev) => acc + rev.rating, 0) / productReviews.length;
      
      await ProductModel.findByIdAndUpdate(review.product, {
        rating: Math.round(avgRating * 10) / 10,
      });
    }

    return res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: true,
        success: false,
      });
    }

    if (review.user.toString() !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'Not authorized to delete this review',
        error: true,
        success: false,
      });
    }

    await ReviewModel.findByIdAndDelete(reviewId);

    // Update product rating
    const productReviews = await ReviewModel.find({ 
      product: review.product, 
      status: 'APPROVED' 
    });
    
    const avgRating = productReviews.length > 0 
      ? productReviews.reduce((acc, rev) => acc + rev.rating, 0) / productReviews.length 
      : 0;
    
    await ProductModel.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
    });

    return res.status(200).json({
      message: 'Review deleted successfully',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: true,
        success: false,
      });
    }

    const existingHelpful = review.helpful.find(h => h.user.toString() === req.userId);
    
    if (existingHelpful) {
      // Update existing helpful vote
      existingHelpful.helpful = helpful;
    } else {
      // Add new helpful vote
      review.helpful.push({ user: req.userId, helpful });
    }

    await review.save();

    return res.status(200).json({
      message: 'Review helpful status updated',
      helpfulCount: review.helpful.filter(h => h.helpful).length,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get all reviews (admin only)
export const getAllReviews = async (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
        error: true,
        success: false,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const reviews = await ReviewModel.find(query)
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReviewModel.countDocuments(query);

    return res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Moderate review (admin only)
export const moderateReview = async (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
        error: true,
        success: false,
      });
    }

    const { reviewId } = req.params;
    const { status, adminResponse } = req.body;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: true,
        success: false,
      });
    }

    const updateData = { status };
    if (adminResponse) updateData.adminResponse = adminResponse;

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate('user', 'name email')
     .populate('product', 'name images');

    // Update product rating if status changed
    const productReviews = await ReviewModel.find({ 
      product: review.product, 
      status: 'APPROVED' 
    });
    
    const avgRating = productReviews.length > 0 
      ? productReviews.reduce((acc, rev) => acc + rev.rating, 0) / productReviews.length 
      : 0;
    
    await ProductModel.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
    });

    return res.status(200).json({
      message: 'Review moderated successfully',
      review: updatedReview,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
}; 