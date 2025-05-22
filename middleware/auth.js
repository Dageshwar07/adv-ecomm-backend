import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.split(' ')[1]; // Handle "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        message: "Provide token",
        error: true,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access",
      error: true,
      success: false,
    });
  }
};

export default auth;
