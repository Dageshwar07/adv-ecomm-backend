# Validation & Sanitization Guide

This document outlines the comprehensive validation and sanitization system implemented in the e-commerce API using **Joi** for validation and **XSS** for sanitization.

## 🎯 Why Joi?

**Joi** is the industry standard for Node.js validation because:
- ✅ **Mature & Stable**: Used by Netflix, Microsoft, and other major companies
- ✅ **Rich Feature Set**: Advanced validation rules, custom messages, conditional validation
- ✅ **Performance**: Optimized for high-throughput applications
- ✅ **Type Safety**: Excellent TypeScript support
- ✅ **Community**: Large, active community with extensive documentation
- ✅ **Flexibility**: Easy to extend and customize

## 📋 Validation Features

### 1. **Input Validation**
- Request body validation
- Query parameter validation
- URL parameter validation
- File upload validation

### 2. **Data Sanitization**
- XSS protection
- HTML sanitization
- Email normalization
- Phone number formatting
- URL validation and formatting
- Price precision handling

### 3. **Custom Error Messages**
- User-friendly error messages
- Field-specific validation errors
- Localized error responses

## 🔧 Validation Schemas

### User Validation

#### Register User
```javascript
{
  name: string (2-100 chars, required)
  email: valid email (max 100 chars, required)
  password: string (8+ chars, uppercase, lowercase, number, special char, required)
}
```

#### Login User
```javascript
{
  email: valid email (required)
  password: string (required)
}
```

#### Verify Email
```javascript
{
  code: string (6 digits, required)
}
```

#### Forgot Password
```javascript
{
  email: valid email (required)
}
```

#### Reset Password
```javascript
{
  otp: string (6 digits, required)
  password: string (8+ chars, uppercase, lowercase, number, special char, required)
}
```

### Product Validation

#### Create Product
```javascript
{
  name: string (3-200 chars, required)
  description: string (10-2000 chars, required)
  price: number (min 0, 2 decimal places, required)
  oldPrice: number (min 0, 2 decimal places, optional)
  category: ObjectId (required)
  brand: string (2-100 chars, required)
  countInStock: integer (min 0, required)
  images: array of URLs (1-10 items, required)
  discount: number (0-100, default 0)
  isFeatured: boolean (default false)
  productColor: string (max 50 chars, optional)
  productRam: string (max 50 chars, optional)
  size: string (max 50 chars, optional)
  location: string (max 100 chars, default 'All')
  productWeight: number (min 0.1, default 1)
}
```

#### Product Query Parameters
```javascript
{
  page: integer (min 1, default 1)
  limit: integer (1-100, default 10)
  search: string (max 100 chars, optional)
  category: ObjectId (optional)
  minPrice: number (min 0, optional)
  maxPrice: number (min 0, optional)
  brand: string (max 100 chars, optional)
  isFeatured: boolean (optional)
  sortBy: 'price' | 'name' | 'rating' | 'createdAt' (default 'createdAt')
  sortOrder: 'asc' | 'desc' (default 'desc')
}
```

### Order Validation

#### Create Order
```javascript
{
  orderItems: array of objects (min 1, required)
    - product: ObjectId (required)
    - quantity: integer (min 1, required)
    - price: number (min 0, required)
    - totalPrice: number (min 0, required)
    - selectedSize: string (max 50 chars, optional)
    - selectedColor: string (max 50 chars, optional)
    - selectedRAM: string (max 50 chars, optional)
  shippingAddress: ObjectId (required)
  paymentMethod: 'COD' | 'ONLINE' | 'WALLET' (default 'COD')
  itemsPrice: number (min 0, required)
  taxPrice: number (min 0, required)
  shippingPrice: number (min 0, required)
  totalPrice: number (min 0, required)
  notes: string (max 500 chars, optional)
}
```

#### Update Order Status
```javascript
{
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  trackingNumber: string (max 100 chars, optional)
  notes: string (max 500 chars, optional)
  cancelReason: string (max 500 chars, optional)
}
```

### Review Validation

#### Create Review
```javascript
{
  productId: ObjectId (required)
  rating: number (1-5, required)
  title: string (3-100 chars, required)
  comment: string (10-1000 chars, required)
  images: array of URLs (max 5 items, optional)
}
```

#### Update Review
```javascript
{
  rating: number (1-5, optional)
  title: string (3-100 chars, optional)
  comment: string (10-1000 chars, optional)
  images: array of URLs (max 5 items, optional)
}
```

#### Mark Review Helpful
```javascript
{
  helpful: boolean (required)
}
```

### Address Validation

#### Create Address
```javascript
{
  fullName: string (2-100 chars, required)
  phone: valid phone number (required)
  addressLine1: string (5-200 chars, required)
  addressLine2: string (max 200 chars, optional)
  city: string (2-100 chars, required)
  state: string (2-100 chars, required)
  postalCode: valid postal code (required)
  country: string (2-100 chars, required)
  isDefault: boolean (default false)
  addressType: 'HOME' | 'WORK' | 'OTHER' (default 'HOME')
}
```

### Cart Validation

#### Add to Cart
```javascript
{
  product: ObjectId (required)
  quantity: integer (min 1, required)
  selectedSize: string (max 50 chars, optional)
  selectedColor: string (max 50 chars, optional)
  selectedRAM: string (max 50 chars, optional)
}
```

#### Update Cart Item
```javascript
{
  quantity: integer (min 1, required)
}
```

### Wishlist Validation

#### Add to Wishlist
```javascript
{
  product: ObjectId (required)
}
```

## 🛡️ Sanitization Features

### 1. **XSS Protection**
- Removes all HTML tags by default
- Strips script tags and malicious content
- Configurable whitelist for safe HTML

### 2. **Field-Specific Sanitization**

#### Email Sanitization
- Converts to lowercase
- Trims whitespace
- Validates email format

#### Phone Number Sanitization
- Removes invalid characters
- Preserves digits, spaces, +, -, (, )
- Standardizes format

#### URL Sanitization
- Ensures URLs start with http:// or https://
- Validates URL format
- Applies to image, avatar, and link fields

#### Price Sanitization
- Converts to numbers
- Rounds to 2 decimal places
- Handles currency precision

#### HTML Content Sanitization
- Allows safe HTML tags for rich content
- Strips dangerous tags (script, iframe, etc.)
- Applies to description, comment, notes fields

### 3. **Comprehensive Sanitization**
All routes automatically apply:
- XSS protection
- Email normalization
- Phone formatting
- URL validation
- Price precision
- HTML sanitization

## 📝 Error Response Format

### Validation Error Response
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must contain at least 8 characters with uppercase, lowercase, number, and special character",
      "value": "weak"
    }
  ],
  "error": true,
  "success": false
}
```

### Query Validation Error
```json
{
  "message": "Query validation failed",
  "errors": [
    {
      "field": "page",
      "message": "page must be at least 1",
      "value": "0"
    }
  ],
  "error": true,
  "success": false
}
```

## 🔧 Usage Examples

### Route with Validation
```javascript
import { validate, validateQuery } from '../middleware/validation.js';
import { userValidation } from '../middleware/validation.js';

// Body validation
router.post('/register', validate(userValidation.register), registerController);

// Query validation
router.get('/products', validateQuery(productValidation.query), getProductsController);

// Parameter validation
router.get('/product/:id', validateParams(Joi.object({ 
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() 
})), getProductController);
```

### Custom Validation
```javascript
const customSchema = Joi.object({
  customField: Joi.string().custom((value, helpers) => {
    if (value.length < 5) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'custom validation').messages({
    'any.invalid': 'Custom field must be at least 5 characters long'
  })
});
```

## 🚀 Best Practices

### 1. **Always Validate Input**
- Never trust client-side validation
- Validate all user inputs
- Use appropriate validation rules

### 2. **Sanitize Data**
- Clean all input data
- Remove malicious content
- Normalize data formats

### 3. **Provide Clear Error Messages**
- Use user-friendly messages
- Include field names
- Explain validation requirements

### 4. **Handle Edge Cases**
- Validate file uploads
- Check data types
- Handle empty/null values

### 5. **Performance Considerations**
- Use efficient validation rules
- Cache validation schemas
- Optimize for high throughput

## 🔍 Testing Validation

### Test Valid Data
```javascript
// Should pass validation
const validData = {
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!"
};
```

### Test Invalid Data
```javascript
// Should fail validation
const invalidData = {
  name: "J", // Too short
  email: "invalid-email", // Invalid email
  password: "weak" // Too weak
};
```

## 📚 Additional Resources

- [Joi Documentation](https://joi.dev/)
- [XSS Package](https://github.com/leizongmin/js-xss)
- [Express Validation Best Practices](https://expressjs.com/en/guide/error-handling.html)

---

This validation system ensures your API is secure, robust, and user-friendly while maintaining high performance standards. 