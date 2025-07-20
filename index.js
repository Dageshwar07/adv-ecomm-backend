// index.js or server.js

import express from 'express';
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config(); // Load .env files based on NODE_ENV

import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/connectDB.js';
import errorHandler from './middleware/errorHandler.js';
import { comprehensiveSanitize } from './middleware/sanitize.js';
import userRouter from './routes/user.route.js';
import cartRouter from './routes/cart.route.js';
import categoryRouter from './routes/category.route.js';
import productRouter from './routes/product.route.js';
import mylistRouter from './routes/mylist.route.js';
import orderRouter from './routes/order.route.js';
import reviewRouter from './routes/review.route.js';
import addressRouter from './routes/address.route.js';
import subcategoryRouter from './routes/subcategory.route.js';
import logRequestResponse from './middleware/logger.js';

const app = express();

/* ---------- DB Connection ---------- */
connectDB();

/* ---------- Security + Perf Middlewares ---------- */

// CORS – only allow defined origins
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'];
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error('Not allowed by CORS')),
    credentials: true,
  })
);

// Helmet – disable CORP for cross-origin video/HLS
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Rate limiter – use RedisStore in distributed env
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // max requests per IP per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// JSON body parsing – limit size for security
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Sanitization middleware
app.use(comprehensiveSanitize);
app.use(logRequestResponse);

/* ---------- Routes ---------- */
app.get('/', (_req, res) => {
  res.send(`API is running in ${process.env.NODE_ENV || 'development'} mode`);
});
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/mylist", mylistRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/address", addressRouter);
app.use("/api/subcategory", subcategoryRouter);

/* ---------- Global Error Handler ---------- */
app.use(errorHandler);

/* ---------- Server Bootstrap ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
