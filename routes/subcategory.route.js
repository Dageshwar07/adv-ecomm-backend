import express from 'express';
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategory,
} from '../controllers/subcategory.controller.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { validate, validateQuery, validateParams } from '../middleware/validation.js';
import { subcategoryValidation } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Public routes
router.get('/all', validateQuery(Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  isActive: Joi.boolean(),
})), getAllSubCategories);
router.get('/category/:categoryId', validateParams(Joi.object({ categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), getSubCategoriesByCategory);
router.get('/:id', validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), getSubCategoryById);

// Admin routes (require admin authentication)
router.post('/create', auth, adminAuth, validate(subcategoryValidation.create), createSubCategory);
router.put('/:id', auth, adminAuth, validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(subcategoryValidation.update), updateSubCategory);
router.delete('/:id', auth, adminAuth, validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), deleteSubCategory);

export default router; 