import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

export async function addToCartItemController(request, response) {
  try {
    const userId = request.userId;
    const { productId } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    // Check if the item already exists in the cart
    const checkItemCart = await CartProductModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (checkItemCart) {
      return response.status(400).json({
        message: "Item already in cart",
        error: true,
        success: false,
      });
    }

    // Add item to CartProduct collection
    const cartItem = new CartProductModel({
      userId: userId,
      productId: productId,
      quantity: 1,
    });

    const savedItem = await cartItem.save();

    // Update user's shopping_cart reference
    await UserModel.updateOne(
      { _id: userId },
      { $push: { shopping_cart: savedItem._id } }
    );

    return response.json({
      data: savedItem,
      message: "Item added to cart successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    const cartItems = await CartProductModel.find({ userId })
      .populate("productId"); // Populate product details

    return response.json({
      data: cartItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
};

export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty } = request.body;

    if (!_id || !qty) {
      return response.status(400).json({
        message: "Please provide both _id and qty",
        success: false,
        error: true,
      });
    }

    const updateCartItem = await CartProductModel.updateOne(
      { _id, userId },
      { $set: { quantity: qty } }
    );

    return response.json({
      message: "Cart item quantity updated successfully",
      success: true,
      error: false,
      data: updateCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server Error",
      success: false,
      error: true,
    });
  }
};

export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId; // From auth middleware
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Please provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id,
      userId,
    });

    return response.json({
      message: "Item removed from cart",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

