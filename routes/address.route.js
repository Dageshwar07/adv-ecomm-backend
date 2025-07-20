import express from 'express';
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from '../controllers/address.controller.js';
import auth from '../middleware/auth.js';
import { validate, validateParams } from '../middleware/validation.js';
import { addressValidation } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/create', validate(addressValidation.create), createAddress);
router.get('/all', getUserAddresses);
router.get('/default', getDefaultAddress);
router.get('/:id', validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), getAddressById);
router.put('/:id', validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), validate(addressValidation.update), updateAddress);
router.delete('/:id', validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), deleteAddress);
router.put('/:id/default', validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), setDefaultAddress);

export default router; 