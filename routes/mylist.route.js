import { Router } from 'express';
const mylistRouter = Router();
import auth from '../middleware/auth.js';
import { validate, validateParams } from '../middleware/validation.js';
import { wishlistValidation } from '../middleware/validation.js';
import Joi from 'joi';
import { addToMyListController, deleteToMyListController, getMyListController } from '../controllers/mylist.controller.js';
mylistRouter.post('/add', auth, validate(wishlistValidation.add), addToMyListController);
mylistRouter.delete('/delete/:id', auth, validateParams(Joi.object({ id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() })), deleteToMyListController);
mylistRouter.get('/get', auth, getMyListController);

export default mylistRouter;