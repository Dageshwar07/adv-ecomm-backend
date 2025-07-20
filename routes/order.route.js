import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from '../controllers/order.controller.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { validate, validateQuery, validateParams } from '../middleware/validation.js';
import { orderValidation } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// User routes (require authentication)
router.post('/create', auth, validate(orderValidation.create), createOrder);
router.get('/my-orders', auth, validateQuery(orderValidation.query), getUserOrders);
router.get('/:id', auth, validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), getOrderById);
router.put('/:id/cancel', auth, validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(orderValidation.cancel), cancelOrder);

// Admin routes (require admin authentication)
router.get('/admin/all', auth, adminAuth, validateQuery(orderValidation.query), getAllOrders);
router.put('/admin/:id/status', auth, adminAuth, validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(orderValidation.updateStatus), updateOrderStatus);
router.get('/admin/stats', auth, adminAuth, getOrderStats);

export default router; 