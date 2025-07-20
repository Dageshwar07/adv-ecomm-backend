import Joi from 'joi';

// Custom validation messages
const customMessages = {
  'string.empty': '{{#label}} cannot be empty',
  'string.min': '{{#label}} must be at least {{#limit}} characters long',
  'string.max': '{{#label}} cannot exceed {{#limit}} characters',
  'string.email': 'Please provide a valid email address',
  'string.pattern.base': '{{#label}} format is invalid',
  'number.base': '{{#label}} must be a number',
  'number.min': '{{#label}} must be at least {{#limit}}',
  'number.max': '{{#label}} cannot exceed {{#limit}}',
  'array.min': '{{#label}} must have at least {{#limit}} item(s)',
  'array.max': '{{#label}} cannot have more than {{#limit}} items',
  'object.unknown': '{{#label}} is not allowed',
  'any.required': '{{#label}} is required',
  'any.only': '{{#label}} must be one of {{#valids}}',
};

// Common validation patterns
const patterns = {
  phone: /^[+]?[\d\s\-\(\)]{10,15}$/,
  postalCode: /^[\d\w\s\-]{3,10}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  url: /^https?:\/\/.+$/,
};

// Common field validations
const commonFields = {
  objectId: Joi.string().pattern(patterns.objectId).messages({
    'string.pattern.base': 'Invalid ID format',
  }),
  email: Joi.string().email().max(100).messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(8).max(100).pattern(patterns.password).messages({
    'string.pattern.base': 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  }),
  name: Joi.string().min(2).max(100).trim(),
  phone: Joi.string().pattern(patterns.phone).messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  price: Joi.number().min(0).precision(2),
  quantity: Joi.number().integer().min(1),
  rating: Joi.number().min(1).max(5),
  url: Joi.string().uri().messages({
    'string.uri': 'Please provide a valid URL',
  }),
};

// User validation schemas
export const userValidation = {
  register: Joi.object({
    name: commonFields.name.required(),
    email: commonFields.email.required(),
    password: commonFields.password.required(),
  }).messages(customMessages),

  login: Joi.object({
    email: commonFields.email.required(),
    password: Joi.string().required(),
  }).messages(customMessages),

  verifyEmail: Joi.object({
    code: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'Verification code must be 6 digits',
    }),
  }).messages(customMessages),

  forgotPassword: Joi.object({
    email: commonFields.email.required(),
  }).messages(customMessages),

  resetPassword: Joi.object({
    otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'OTP must be 6 digits',
    }),
    password: commonFields.password.required(),
  }).messages(customMessages),

  updateProfile: Joi.object({
    name: commonFields.name,
    mobile: commonFields.phone,
    avatar: commonFields.url,
  }).messages(customMessages),
};

// Product validation schemas
export const productValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    price: commonFields.price.required(),
    oldPrice: commonFields.price,
    category: commonFields.objectId.required(),
    brand: Joi.string().min(2).max(100).required(),
    countInStock: Joi.number().integer().min(0).required(),
    images: Joi.array().items(commonFields.url).min(1).max(10).required(),
    discount: Joi.number().min(0).max(100).default(0),
    isFeatured: Joi.boolean().default(false),
    productColor: Joi.string().max(50),
    productRam: Joi.string().max(50),
    size: Joi.string().max(50),
    location: Joi.string().max(100).default('All'),
    productWeight: Joi.number().min(0.1).default(1),
  }).messages(customMessages),

  update: Joi.object({
    name: Joi.string().min(3).max(200),
    description: Joi.string().min(10).max(2000),
    price: commonFields.price,
    oldPrice: commonFields.price,
    category: commonFields.objectId,
    brand: Joi.string().min(2).max(100),
    countInStock: Joi.number().integer().min(0),
    images: Joi.array().items(commonFields.url).min(1).max(10),
    discount: Joi.number().min(0).max(100),
    isFeatured: Joi.boolean(),
    productColor: Joi.string().max(50),
    productRam: Joi.string().max(50),
    size: Joi.string().max(50),
    location: Joi.string().max(100),
    productWeight: Joi.number().min(0.1),
  }).messages(customMessages),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100),
    category: commonFields.objectId,
    minPrice: commonFields.price,
    maxPrice: commonFields.price,
    brand: Joi.string().max(100),
    isFeatured: Joi.boolean(),
    sortBy: Joi.string().valid('price', 'name', 'rating', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }).messages(customMessages),
};

// Category validation schemas
export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    image: commonFields.url,
    isActive: Joi.boolean().default(true),
    sortOrder: Joi.number().integer().min(0).default(0),
  }).messages(customMessages),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500),
    image: commonFields.url,
    isActive: Joi.boolean(),
    sortOrder: Joi.number().integer().min(0),
  }).messages(customMessages),
};

// Subcategory validation schemas
export const subcategoryValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    category: commonFields.objectId.required(),
    image: commonFields.url,
    isActive: Joi.boolean().default(true),
    sortOrder: Joi.number().integer().min(0).default(0),
    metaTitle: Joi.string().max(60),
    metaDescription: Joi.string().max(160),
  }).messages(customMessages),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500),
    category: commonFields.objectId,
    image: commonFields.url,
    isActive: Joi.boolean(),
    sortOrder: Joi.number().integer().min(0),
    metaTitle: Joi.string().max(60),
    metaDescription: Joi.string().max(160),
  }).messages(customMessages),
};

// Order validation schemas
export const orderValidation = {
  create: Joi.object({
    orderItems: Joi.array().items(
      Joi.object({
        product: commonFields.objectId.required(),
        quantity: commonFields.quantity.required(),
        price: commonFields.price.required(),
        totalPrice: commonFields.price.required(),
        selectedSize: Joi.string().max(50),
        selectedColor: Joi.string().max(50),
        selectedRAM: Joi.string().max(50),
      })
    ).min(1).required(),
    shippingAddress: commonFields.objectId.required(),
    paymentMethod: Joi.string().valid('COD', 'ONLINE', 'WALLET').default('COD'),
    itemsPrice: commonFields.price.required(),
    taxPrice: commonFields.price.required(),
    shippingPrice: commonFields.price.required(),
    totalPrice: commonFields.price.required(),
    notes: Joi.string().max(500),
  }).messages(customMessages),

  updateStatus: Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'),
    trackingNumber: Joi.string().max(100),
    notes: Joi.string().max(500),
    cancelReason: Joi.string().max(500),
  }).messages(customMessages),

  cancel: Joi.object({
    cancelReason: Joi.string().max(500),
  }).messages(customMessages),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'),
    search: Joi.string().max(100),
  }).messages(customMessages),
};

// Review validation schemas
export const reviewValidation = {
  create: Joi.object({
    productId: commonFields.objectId.required(),
    rating: commonFields.rating.required(),
    title: Joi.string().min(3).max(100).required(),
    comment: Joi.string().min(10).max(1000).required(),
    images: Joi.array().items(commonFields.url).max(5),
  }).messages(customMessages),

  update: Joi.object({
    rating: commonFields.rating,
    title: Joi.string().min(3).max(100),
    comment: Joi.string().min(10).max(1000),
    images: Joi.array().items(commonFields.url).max(5),
  }).messages(customMessages),

  helpful: Joi.object({
    helpful: Joi.boolean().required(),
  }).messages(customMessages),

  moderate: Joi.object({
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
    adminResponse: Joi.string().max(500),
  }).messages(customMessages),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    rating: commonFields.rating,
    sort: Joi.string().valid('newest', 'oldest', 'rating').default('newest'),
  }).messages(customMessages),
};

// Address validation schemas
export const addressValidation = {
  create: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    phone: commonFields.phone.required(),
    addressLine1: Joi.string().min(5).max(200).required(),
    addressLine2: Joi.string().max(200),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    postalCode: Joi.string().pattern(patterns.postalCode).required().messages({
      'string.pattern.base': 'Please provide a valid postal code',
    }),
    country: Joi.string().min(2).max(100).required(),
    isDefault: Joi.boolean().default(false),
    addressType: Joi.string().valid('HOME', 'WORK', 'OTHER').default('HOME'),
  }).messages(customMessages),

  update: Joi.object({
    fullName: Joi.string().min(2).max(100),
    phone: commonFields.phone,
    addressLine1: Joi.string().min(5).max(200),
    addressLine2: Joi.string().max(200),
    city: Joi.string().min(2).max(100),
    state: Joi.string().min(2).max(100),
    postalCode: Joi.string().pattern(patterns.postalCode).messages({
      'string.pattern.base': 'Please provide a valid postal code',
    }),
    country: Joi.string().min(2).max(100),
    isDefault: Joi.boolean(),
    addressType: Joi.string().valid('HOME', 'WORK', 'OTHER'),
  }).messages(customMessages),
};

// Cart validation schemas
export const cartValidation = {
  add: Joi.object({
    product: commonFields.objectId.required(),
    quantity: commonFields.quantity.required(),
    selectedSize: Joi.string().max(50),
    selectedColor: Joi.string().max(50),
    selectedRAM: Joi.string().max(50),
  }).messages(customMessages),

  update: Joi.object({
    quantity: commonFields.quantity.required(),
  }).messages(customMessages),
};

// Wishlist validation schemas
export const wishlistValidation = {
  add: Joi.object({
    product: commonFields.objectId.required(),
  }).messages(customMessages),
};

// Banner validation schemas
export const bannerValidation = {
  create: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    image: commonFields.url.required(),
    mobileImage: commonFields.url,
    link: Joi.string().max(500),
    linkType: Joi.string().valid('PRODUCT', 'CATEGORY', 'EXTERNAL', 'NONE').default('NONE'),
    linkTarget: Joi.string().max(100),
    position: Joi.string().valid('TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR').default('TOP'),
    sortOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true),
    startDate: Joi.date().default(Date.now),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    backgroundColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#ffffff'),
    textColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#000000'),
  }).messages(customMessages),
};

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors,
        error: true,
        success: false,
      });
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        message: 'Query validation failed',
        errors,
        error: true,
        success: false,
      });
    }

    // Replace request query with validated data
    req.query = value;
    next();
  };
};

// Params validation middleware
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        message: 'Parameter validation failed',
        errors,
        error: true,
        success: false,
      });
    }

    // Replace request params with validated data
    req.params = value;
    next();
  };
}; 