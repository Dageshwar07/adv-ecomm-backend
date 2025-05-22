import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import {sendEmail} from '../config/sendEmail.js';
import {verifyEmailTemplate} from '../utils/verifyEmailTemplate.js';
// import uploadImageClodinary from '../utils/uploadImageClodinary.js';
// import generatedOtp from '../utils/generatedOtp.js';
import {forgotPasswordTemplate} from '../utils/forgotPasswordTemplate.js';
import generateAccessToken from '../utils/generatedAccessToken.js';
import generateRefreshToken from '../utils/generatedRefreshToken.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Provide name, email, and password',
        error: true,
        success: false,
      });
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'Email already registered',
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      otp: verifyCode,
      otp_expiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    });

    const savedUser = await newUser.save();

    // Generate tokens with userId and email
    const accessToken = generateAccessToken(savedUser._id);
    const refreshToken = generateRefreshToken(savedUser._id);

// Save refresh token in user
savedUser.refresh_token = refreshToken;
await savedUser.save();
decoded.userId
// Set refresh token in HTTP-only cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


    // Send verification email
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser._id}`;
    await sendEmail({
      sendTo: email,
      subject: 'Verify your email',
      html: verifyEmailTemplate({
        name,
        url: verifyEmailUrl,
        // url: `http://localhost:8000/api/user/verify-email/${verifyCode}`
        otp: verifyCode,
      }),
    });

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      accessToken,
      success: true,
      error: false,
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
}

export const verifyEmailController = async (req, res) => {
  try {
    const { code } = req.body;

    // Find the user by verification code
    const user = await UserModel.findOne({ otp: code });

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification code",
        error: true,
        success: false,
      });
    }

    // Check if OTP has expired
    if (user.otp_expiry && user.otp_expiry < new Date()) {
      return res.status(400).json({
        message: "Verification code has expired",
        error: true,
        success: false,
      });
    }

    // Update verification status
    await UserModel.updateOne(
      { _id: user._id },
      {
        verify_email: true,
        verifyCode: null,
        otp_expiry: null,
      }
    );

    return res.json({
      message: "Email verified successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

export const loginUserController=async(req, res)=> {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    // User not found
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    // Check if user is active (optional business logic)
    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Account not active. Please contact admin.",
        error: true,
        success: false,
      });
    }
    if (user.verify_email !== true) {
      // User not verified
      return res.status(400).json({
        message: "Your Email is not verify yet please verify your email first",
        error: true,
        success: false,
      });
    }
   
    // Compare password
    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid password",
        error: true,
        success: false,
      });
    }

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update user's last login
    await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      refresh_token: refreshToken,
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      error: false,
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
export const logoutController = async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    };

    // Clear tokens from cookies
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    // Remove refresh token from DB
    await UserModel.findByIdAndUpdate(userId, {
      refresh_token: null,
    });

    return res.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Logout failed",
      error: true,
      success: false,
    });
  }
};
// Upload Avatar Controller
export async function userAvatarController(req, res) {
  try {
    const userId = req.userId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No image file provided",
        error: true,
        success: false,
      });
    }

    // 1. Get existing user
    const user = await UserModel.findById(userId);
    const oldAvatarUrl = user?.avatar;

    // 2. Delete old avatar from Cloudinary
    if (oldAvatarUrl) {
      const urlParts = oldAvatarUrl.split('/');
      const fileNameWithExt = urlParts[urlParts.length - 1]; // e.g., 1747927871384_image.jpg
      const publicId = fileNameWithExt.split('.')[0];         // e.g., 1747927871384_image

      await cloudinary.uploader.destroy(publicId);
    }

    // 3. Upload new avatar
    const result = await cloudinary.uploader.upload(files[0].path, {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    const newAvatarUrl = result.secure_url;

    // 4. Delete file from local disk
    fs.unlinkSync(files[0].path);

    // 5. Update avatar in DB
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { avatar: newAvatarUrl },
      { new: true }
    );

    return res.status(200).json({
      message: 'Avatar updated successfully',
      avatar: newAvatarUrl,
      userId: updatedUser._id,
      success: true,
      error: false,
    });

  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({
      message: error.message || "Upload failed",
      error: true,
      success: false,
    });
  }
}

export async function removeImageFromCloudinary(req, res) {
  try {
    const imgUrl = req.query.img;

    if (!imgUrl) {
      return res.status(400).json({
        message: "Image URL is required",
        error: true,
        success: false,
      });
    }

    // Extract public_id (remove domain, version, file extension)
    const urlParts = imgUrl.split('/');
    const fileNameWithExt = urlParts[urlParts.length - 1]; // 1747927871384_image.jpg
    const fileName = fileNameWithExt.split('.')[0]; // 1747927871384_image

    // Destroy using Cloudinary public_id
    const result = await cloudinary.uploader.destroy(fileName);

    if (result.result === 'ok') {
      return res.status(200).json({
        message: "Image deleted successfully",
        success: true,
        error: false,
        result,
      });
    } else if (result.result === 'not found') {
      return res.status(404).json({
        message: "Image not found on Cloudinary",
        success: false,
        error: true,
      });
    } else {
      return res.status(500).json({
        message: "Image deletion failed",
        success: false,
        error: true,
        result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unexpected error during image deletion",
      error: true,
      success: false,
    });
  }
}

export async function updateUserDetails(req, res) {
  try {
    const userId = req.params.id; // Getting ID from URL
    const { name, email, mobile, password } = req.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    let verifyCode = "";
    if (email && email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    let hashPassword = userExist.password;
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name,
        mobile,
        email,
        verify_email: email && email !== userExist.email ? false : userExist.verify_email,
        password: hashPassword,
        otp: verifyCode || userExist.otp,
        otp_expiry: verifyCode ? new Date(Date.now() + 10 * 60 * 1000) : userExist.otp_expiry,
      },
      { new: true }
    );    

    // If email changed, send OTP
    if (verifyCode) {
      await sendEmail({
        sendTo: email,
        subject: "Verify your email - Ecommerce App",
        html: verifyEmailTemplate({
          name: name || userExist.name,
          otp: verifyCode,
          url: `${process.env.FRONTEND_URL}/verify-email?email=${email}`
        }),
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      error: false,
      user: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      success: false,
      error: true,
    });
  }
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email not found",
        error: true,
        success: false,
      });
    }

    const otp = generateOtp();
    const expireTime = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(expireTime),
    });

    await sendEmail({
      sendTo: email,
      subject: "Forgot Password - Dageshwar Store",
      html: forgotPasswordTemplate({ name: user.name, otp }),
    });

    return res.json({
      message: "OTP sent to your email",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide required fields: email and otp.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available.",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date();

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "OTP is expired.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid OTP.",
        error: true,
        success: false,
      });
    }

    // Clear the OTP and expiry after successful verification
    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: null,
      forgot_password_expiry: null,
    });

    return res.json({
      message: "OTP verified successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Provide required fields: email, newPassword, confirmPassword.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email is not available.",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "newPassword and confirmPassword do not match.",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashPassword,
    });

    return res.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.headers?.authorization?.split(" ")[1]; // Optional Bearer token support

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
        error: true,
        success: false,
      });
    }

    // Verify the refresh token
    const verifyToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!verifyToken) {
      return res.status(401).json({
        message: "Token is expired or invalid",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?.id;

    const newAccessToken = await generateAccessToken(userId);

    // Set access token in cookie
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie('accessToken', newAccessToken, cookiesOption);

    return res.json({
      message: "New access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}


export async function userDetails(req, res) {
  try {
    const userId = req.userId;

    const user = await UserModel.findById(userId).select('-password -refresh_token');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "User details fetched successfully",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
}