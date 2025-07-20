import OrderModel from '../models/order.model.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import CartProductModel from '../models/cartproduct.model.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      notes,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: 'No order items',
        error: true,
        success: false,
      });
    }

    // Validate stock availability
    for (const item of orderItems) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        return res.status(400).json({
          message: `Product ${item.product} not found`,
          error: true,
          success: false,
        });
      }
      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
          error: true,
          success: false,
        });
      }
    }

    const order = new OrderModel({
      user: req.userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      notes,
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
      await ProductModel.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -item.quantity } }
      );
    }

    // Clear user's cart
    await CartProductModel.deleteMany({ user: req.userId });

    // Update user's order history
    await UserModel.findByIdAndUpdate(
      req.userId,
      { $push: { order_history: createdOrder._id } }
    );

    const populatedOrder = await OrderModel.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price')
      .populate('shippingAddress');

    return res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price brand')
      .populate('shippingAddress');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
        success: false,
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'Not authorized to access this order',
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      order,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await OrderModel.find({ user: req.userId })
      .populate('orderItems.product', 'name images price')
      .populate('shippingAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments({ user: req.userId });

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
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
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'paymentResult.id': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await OrderModel.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price')
      .populate('shippingAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments(query);

    return res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
        error: true,
        success: false,
      });
    }

    const { status, trackingNumber, notes, cancelReason } = req.body;

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
        success: false,
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    if (cancelReason) updateData.cancelReason = cancelReason;

    // Handle status-specific updates
    if (status === 'DELIVERED') {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    } else if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      // Restore product stock if order is cancelled
      for (const item of order.orderItems) {
        await ProductModel.findByIdAndUpdate(
          item.product,
          { $inc: { countInStock: item.quantity } }
        );
      }
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email')
     .populate('orderItems.product', 'name images price')
     .populate('shippingAddress');

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Cancel order (user)
export const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
        error: true,
        success: false,
      });
    }

    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Not authorized to cancel this order',
        error: true,
        success: false,
      });
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({
        message: 'Order cannot be cancelled at this stage',
        error: true,
        success: false,
      });
    }

    // Restore product stock
    for (const item of order.orderItems) {
      await ProductModel.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } }
      );
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      {
        status: 'CANCELLED',
        cancelReason: cancelReason || 'Cancelled by user',
      },
      { new: true }
    ).populate('user', 'name email')
     .populate('orderItems.product', 'name images price')
     .populate('shippingAddress');

    return res.status(200).json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get order statistics (admin only)
export const getOrderStats = async (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
        error: true,
        success: false,
      });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      yearOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      yearRevenue,
    ] = await Promise.all([
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      OrderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      OrderModel.countDocuments({ createdAt: { $gte: startOfYear } }),
      OrderModel.countDocuments({ status: 'PENDING' }),
      OrderModel.countDocuments({ status: 'DELIVERED' }),
      OrderModel.countDocuments({ status: 'CANCELLED' }),
      OrderModel.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: startOfYear }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    return res.status(200).json({
      stats: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          month: monthOrders,
          year: yearOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0,
          month: monthRevenue[0]?.total || 0,
          year: yearRevenue[0]?.total || 0,
        },
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
}; 