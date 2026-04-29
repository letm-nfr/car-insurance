import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger.js'

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health check
    return req.path === '/health'
  },
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, 'generalLimiter: Rate limit exceeded')
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
    })
  },
})

/**
 * Auth endpoints rate limiter (stricter)
 * 5 OTP requests per 15 minutes per IP
 * Prevents OTP brute forcing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many OTP requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path, email: req.body?.email }, 'authLimiter: Rate limit exceeded for auth endpoint')
    res.status(429).json({
      message: 'Too many OTP requests. Please try again later.',
    })
  },
})

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests for this operation. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, 'strictLimiter: Rate limit exceeded for sensitive operation')
    res.status(429).json({
      message: 'Too many requests for this operation. Please try again later.',
    })
  },
})

export default {
  generalLimiter,
  authLimiter,
  strictLimiter,
}
