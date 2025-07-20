# E-Commerce Backend API

A robust, scalable e-commerce backend API built with Node.js, Express, and MongoDB. This API provides comprehensive functionality for managing products, orders, users, reviews, and more.

## 🚀 Features

### Core Features
- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations, categories, subcategories, variants
- **Order Management**: Complete order lifecycle, status tracking, analytics
- **Review System**: Product reviews with moderation and helpful voting
- **Cart Management**: Shopping cart functionality
- **Address Management**: Multiple addresses with default selection
- **Wishlist**: User wishlist functionality
- **Banner Management**: Promotional banners and homepage banners

### Advanced Features
- **Role-based Access Control**: Admin and user roles
- **Email Verification**: User email verification system
- **Password Reset**: Secure password reset functionality
- **File Upload**: Image upload with Cloudinary integration
- **Rate Limiting**: API rate limiting for security
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Request validation and sanitization
- **Pagination**: Efficient pagination for all list endpoints
- **Search & Filtering**: Advanced search and filtering capabilities

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator
- **Environment**: dotenv-flow

## 📁 Project Structure

```
server/
├── config/                 # Configuration files
│   ├── connectDB.js       # Database connection
│   ├── imageStore.js      # Image storage config
│   └── sendEmail.js       # Email configuration
├── controllers/           # Route controllers
│   ├── user.controller.js
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── review.controller.js
│   ├── address.controller.js
│   ├── category.controller.js
│   ├── subcategory.controller.js
│   ├── cart.controller.js
│   └── mylist.controller.js
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── adminAuth.js      # Admin authorization
│   ├── errorHandler.js   # Global error handler
│   └── validate.js       # Validation middleware
├── models/               # Database models
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   ├── review.model.js
│   ├── address.model.js
│   ├── category.model.js
│   ├── subCat.model.js
│   ├── cartproduct.model.js
│   ├── myList.model.js
│   ├── banners.model.js
│   ├── homeBanner.model.js
│   └── ... (other models)
├── routes/               # API routes
│   ├── user.route.js
│   ├── product.route.js
│   ├── order.route.js
│   ├── review.route.js
│   ├── address.route.js
│   ├── category.route.js
│   ├── subcategory.route.js
│   ├── cart.route.js
│   └── mylist.route.js
├── utils/                # Utility functions
│   ├── generatedAccessToken.js
│   ├── generatedRefreshToken.js
│   ├── verifyEmailTemplate.js
│   └── forgotPasswordTemplate.js
├── uploads/              # File uploads
├── index.js              # Main application file
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Cloudinary account (for image uploads)
- Email service (for notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env` files for different environments:
   
   ```bash
   # .env.development
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecomm_dev
   DB_NAME=ecomm_dev
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # CORS Origins
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Email
```http
POST /api/user/verify-email
Content-Type: application/json

{
  "code": "123456"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/product/all?page=1&limit=10&search=phone&category=electronics&minPrice=100&maxPrice=1000
```

#### Get Product by ID
```http
GET /api/product/:id
```

#### Create Product (Admin)
```http
POST /api/product/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Latest iPhone model",
  "price": 999,
  "category": "category_id",
  "brand": "Apple",
  "countInStock": 50
}
```

### Order Endpoints

#### Create Order
```http
POST /api/order/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 999,
      "totalPrice": 1998
    }
  ],
  "shippingAddress": "address_id",
  "paymentMethod": "COD",
  "itemsPrice": 1998,
  "taxPrice": 100,
  "shippingPrice": 50,
  "totalPrice": 2148
}
```

#### Get User Orders
```http
GET /api/order/my-orders?page=1&limit=10
Authorization: Bearer <token>
```

### Review Endpoints

#### Create Review
```http
POST /api/review/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "rating": 5,
  "title": "Great product!",
  "comment": "Excellent quality and fast delivery"
}
```

#### Get Product Reviews
```http
GET /api/review/product/:productId?page=1&limit=10&rating=5&sort=newest
```

### Address Endpoints

#### Create Address
```http
POST /api/address/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "1234567890",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

#### Get User Addresses
```http
GET /api/address/all
Authorization: Bearer <token>
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **Input Validation**: Request validation and sanitization
- **Role-based Access**: Admin and user role management

## 📊 Database Schema

### Key Models

#### User Model
- Basic info (name, email, password)
- Address references
- Order history
- Shopping cart
- Email verification status
- Role-based access

#### Product Model
- Product details (name, description, price)
- Category and subcategory relationships
- Image management
- Stock tracking
- Rating and review aggregation
- Variant support (size, color, RAM)

#### Order Model
- Order items with product references
- Shipping address
- Payment information
- Status tracking
- Analytics data

#### Review Model
- User and product references
- Rating and comments
- Moderation system
- Helpful voting
- Verification status

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in your production environment.

### Database
- Use MongoDB Atlas for production
- Set up proper indexes for performance
- Configure backup and monitoring

### Security
- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up rate limiting
- Use environment-specific configurations

### Performance
- Enable database indexing
- Use CDN for static assets
- Implement caching strategies
- Monitor API performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This API is designed for production use with proper security measures. Always follow security best practices when deploying to production environments. 