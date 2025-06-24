import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

export async function addToCartItemController(req, res) {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required", success: false });
    }

    let cartItem = await CartProductModel.findOne({ userId, productId });

    if (cartItem) {
      // If already in cart, increase quantity by 1
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      cartItem = new CartProductModel({ userId, productId, quantity: 1 });
      await cartItem.save();

      // Optionally push to user model
      await UserModel.updateOne({ _id: userId }, { $push: { shopping_cart: cartItem._id } });
    }

    return res.json({
      message: "Product added to cart",
      success: true,
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
}


export const getCartItemController = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await CartProductModel.find({ userId })
      .populate("productId");

    return res.json({ success: true, data: cartItems });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, qty } = req.body;

    if (!_id || typeof qty !== "number" || qty <= 0) {
      return res.status(400).json({
        message: "Please provide valid _id and qty > 0",
        success: false,
      });
    }

    const cartItem = await CartProductModel.findOne({ _id, userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found", success: false });
    }

    cartItem.quantity = qty;
    await cartItem.save();

    return res.json({
      message: "Cart item quantity updated",
      success: true,
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


export const deleteCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Cart item _id is required", success: false });
    }

    const cartItem = await CartProductModel.findOne({ _id, userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found", success: false });
    }

    await CartProductModel.deleteOne({ _id });
    await UserModel.updateOne({ _id: userId }, { $pull: { shopping_cart: _id } });

    return res.json({
      message: "Item removed from cart",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


