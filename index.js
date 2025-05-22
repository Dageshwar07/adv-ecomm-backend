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
import userRouter from './routes/user.route.js';

const app = express();

/* ---------- DB Connection ---------- */
connectDB();

/* ---------- Security + Perf Middlewares ---------- */

// CORS – only allow defined origins
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'];
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

/* ---------- Routes ---------- */
app.get('/', (_req, res) => {
  res.send(`API is running in ${process.env.NODE_ENV || 'development'} mode`);
});
app.use('/api/user', userRouter);

/* ---------- Global Error Handler ---------- */
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

/* ---------- Server Bootstrap ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT} (${process.env.NODE_ENV})`)
);
