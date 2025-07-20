import UserModel from '../models/user.model.js';

const adminAuth = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
        error: true,
        success: false,
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required',
        error: true,
        success: false,
      });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

export default adminAuth; 