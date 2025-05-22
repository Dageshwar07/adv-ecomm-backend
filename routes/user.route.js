import express from 'express';
import {
//   forgotPasswordController,
loginUserController,
logoutController,
removeImageFromCloudinary,
//   refreshToken,
  registerUserController,

  verifyEmailController,
//   verifyForgotPasswordOtp,
forgotPasswordController,
  userAvatarController,
  updateUserDetails,
//   resetPassword,
//   userDetails,
} from '../controllers/user.controller.js';

import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

// Public routes


userRouter.post('/register', registerUserController);
userRouter.post('/verify', verifyEmailController);
userRouter.post('/login', loginUserController);
userRouter.put('/forgot-password', forgotPasswordController);
// userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp);
// userRouter.put('/reset-password', resetPassword);
// userRouter.post('/refresh-token', refreshToken);
// // Protected routes (require auth middleware)
userRouter.get('/logout', auth, logoutController);
// userRouter.get('/user-details', auth, userDetails);
userRouter.put('/user-avatar', auth, upload.array('avatar'), userAvatarController);
userRouter.delete('/deleteImage', removeImageFromCloudinary); 
userRouter.put('/:id', auth, updateUserDetails);
export default userRouter;
