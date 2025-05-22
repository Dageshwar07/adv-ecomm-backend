import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provide name'],
    },
    email: {
      type: String,
      required: [true, 'Provide email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Provide password'],
    },
    avatar: {
      type: String,
      default: '',
    },
    mobile: {
      type: Number,
      default: null,
    },
    refresh_token: {
      type: String,
      default: '',
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive' , 'Suspended'],
      default: 'Active',
    },
    address_details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
    shopping_cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CartProduct',
    },
    order_history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
  otp: {
      type: String,
      default: '',
    },
    otp_expiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },
  forgot_password_otp: {
    type: String,
    default: '',
  },
  forgot_password_expiry: {
    type: Date,
    default: null,
  },
},
  
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
