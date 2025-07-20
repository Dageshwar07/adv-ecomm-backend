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
  deleteAccountController,
} from '../controllers/user.controller.js';

import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import { validate } from '../middleware/validation.js';
import { userValidation } from '../middleware/validation.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', validate(userValidation.register), registerUserController);
userRouter.post('/verify', validate(userValidation.verifyEmail), verifyEmailController);
userRouter.post('/login', validate(userValidation.login), loginUserController);
userRouter.put('/forgot-password', validate(userValidation.forgotPassword), forgotPasswordController);
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRouter.put('/reset-password', validate(userValidation.resetPassword), resetPassword);
userRouter.post('/refresh-token', refreshToken);

// Protected routes (require auth middleware)
userRouter.get('/logout', auth, logoutController);
userRouter.post('/user-avatar', auth, upload.array('avatar'), userAvatarController);
userRouter.delete('/deleteImage', removeImageFromCloudinary);
userRouter.get('/user-details', auth, userDetails);
userRouter.delete('/delete-account', auth, deleteAccountController);

// 🟡 Always place this dynamic route last!
userRouter.put('/:id', auth, validate(userValidation.updateProfile), updateUserDetails);

export default userRouter;
