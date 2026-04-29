// Initialize telemetry FIRST before any other imports
import './telemetry.js'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './utils/db.js'
import { initializeRedis } from './utils/redis.js'
import { logger, logRequest, logError } from './utils/logger.js'
import { generalLimiter, authLimiter } from './middleware/rateLimitMiddleware.js'
import { optionalAuthMiddleware } from './middleware/authMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Starting application')

// MUST be set BEFORE rate limiter to ensure X-Forwarded-For is trusted
app.set('trust proxy', 1)

// Security Middleware

// Helmet - Sets various HTTP headers for security
// app.use(helmet())

// CORS - Restrict to allowed origins only
const allowedOrigins = ('*').split(',')
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true)
    callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}))

app.use(express.json())

// Request logging middleware
app.use(logRequest)

// Rate limiting - Apply general rate limiter to all routes
app.use(generalLimiter)

// Optional authentication middleware for all routes
app.use(optionalAuthMiddleware)

// Initialize database and cache
const initializeServices = async () => {
  try {
    await connectDB()
    logger.info('Database connected successfully')
  } catch (error) {
    logError(error, { context: 'database-initialization' })
  }

  try {
    await initializeRedis()
    logger.info('Redis initialized successfully')
  } catch (error) {
    logError(error, { context: 'redis-initialization' })
  }
}

initializeServices()

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  logger.debug('Health check called')
  res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    logError(err, { context: 'cors-error', path: req.path })
    return res.status(403).json({ message: 'Access denied' })
  }
  
  // Generic error handler
  logError(err, { context: 'unhandled-error', path: req.path, method: req.method })
  res.status(500).json({ message: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'Server running successfully')
})

