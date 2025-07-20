import { Router } from "express";
import auth from "../middleware/auth.js";
import { validate, validateParams } from "../middleware/validation.js";
import { cartValidation } from "../middleware/validation.js";
import Joi from "joi";

import {
  addToCartItemController,
  deleteCartItemQtyController,
  getCartItemController,
  updateCartItemQtyController,
} from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.post("/create", auth, validate(cartValidation.add), addToCartItemController);
cartRouter.get("/get", auth, getCartItemController);
cartRouter.put("/update-qty", auth, validate(cartValidation.update), updateCartItemQtyController);
cartRouter.delete("/delete-cart-item", auth, deleteCartItemQtyController);

export default cartRouter;
