import express from 'express';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getAllReviews,
  moderateReview,
} from '../controllers/review.controller.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { validate, validateQuery, validateParams } from '../middleware/validation.js';
import { reviewValidation } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Public routes
router.get('/product/:productId', validateParams(Joi.object({ productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validateQuery(reviewValidation.query), getProductReviews);

// User routes (require authentication)
router.post('/create', auth, validate(reviewValidation.create), createReview);
router.get('/my-reviews', auth, validateQuery(reviewValidation.query), getUserReviews);
router.put('/:reviewId', auth, validateParams(Joi.object({ reviewId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(reviewValidation.update), updateReview);
router.delete('/:reviewId', auth, validateParams(Joi.object({ reviewId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), deleteReview);
router.post('/:reviewId/helpful', auth, validateParams(Joi.object({ reviewId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(reviewValidation.helpful), markReviewHelpful);

// Admin routes (require admin authentication)
router.get('/admin/all', auth, adminAuth, validateQuery(reviewValidation.query), getAllReviews);
router.put('/admin/:reviewId/moderate', auth, adminAuth, validateParams(Joi.object({ reviewId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(reviewValidation.moderate), moderateReview);

export default router; 