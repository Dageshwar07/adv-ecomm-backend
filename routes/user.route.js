import express from 'express';
import {
  registerUserController,
  verifyEmailController,
  loginUserController,
  forgotPasswordController,
  verifyForgotPasswordOtp,
  logoutController,
  removeImageFromCloudinary,
  userAvatarController,
  updateUserDetails,
  resetPassword,
  userDetails,
  refreshToken,
} from '../controllers/user.controller.js';

import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUserController);
userRouter.post('/verify', verifyEmailController);
userRouter.post('/login', loginUserController);
userRouter.put('/forgot-password', forgotPasswordController);
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRouter.put('/reset-password', resetPassword);
userRouter.post('/refresh-token', refreshToken);

// Protected routes (require auth middleware)
userRouter.get('/logout', auth, logoutController);
userRouter.put('/user-avatar', auth, upload.array('avatar'), userAvatarController);
userRouter.delete('/deleteImage', removeImageFromCloudinary);
userRouter.get('/user-details', auth, userDetails);

// 🟡 Always place this dynamic route last!
userRouter.put('/:id', auth, updateUserDetails);

export default userRouter;
