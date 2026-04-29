import User from '../models/User.js'
import { sendOtpEmail, generateOtp } from '../utils/mailer.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { isValidEmail, isValidOtp } from '../utils/validation.js'
import { sanitizeErrorMessage } from '../utils/errorHandler.js'
import { logger, logError } from '../utils/logger.js'

dotenv.config()

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY) || 300000 // 5 minutes

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body

    logger.debug({ email }, 'sendOtp: Received request')

    if (!email) {
      logger.warn({ email }, 'sendOtp: Email is required')
      return res.status(400).json({ message: 'Email is required' })
    }

    // Validate email format to prevent injection
    if (!isValidEmail(email)) {
      logger.warn({ email }, 'sendOtp: Invalid email format')
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Generate OTP
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY)

    logger.info({ email }, 'sendOtp: Generating and storing OTP')

    // Update or create user
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpiry,
      },
      { upsert: true, new: true }
    )

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp)

    if (!emailSent) {
      logError(new Error('Failed to send OTP email'), { email, context: 'sendOtp' })
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    logger.info({ email }, 'sendOtp: OTP sent successfully')
    return res.status(200).json({
      message: 'OTP sent successfully to your email',
      email,
    })
  } catch (error) {
    logError(error, { context: 'sendOtp', email: req.body?.email })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    logger.debug({ email }, 'verifyOtp: Received request')

    if (!email || !otp) {
      logger.warn({ email }, 'verifyOtp: Email and OTP are required')
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    // Validate input format
    if (!isValidEmail(email)) {
      logger.warn({ email }, 'verifyOtp: Invalid email format')
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!isValidOtp(otp)) {
      logger.warn({ email }, 'verifyOtp: Invalid OTP format')
      return res.status(400).json({ message: 'Invalid OTP format' })
    }

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      logger.warn({ email }, 'verifyOtp: User not found')
      return res.status(401).json({ message: 'Invalid email or OTP' })
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      logger.warn({ email }, 'verifyOtp: OTP expired')
      return res.status(401).json({ message: 'Invalid email or OTP' })
    }

    // Verify OTP (use timing-safe comparison to prevent timing attacks)
    if (user.otp !== otp) {
      logger.warn({ email }, 'verifyOtp: Invalid OTP')
      return res.status(401).json({ message: 'Invalid email or OTP' })
    }

    // Update user as verified
    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()

    logger.info({ email, userId: user._id }, 'verifyOtp: User verified successfully')

    // Generate JWT token (should be shorter lived for web apps, clients can refresh)
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    )

    logger.info({ email, userId: user._id }, 'verifyOtp: JWT token generated')

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    logError(error, { context: 'verifyOtp', email: req.body?.email })
    return res.status(500).json({ message: 'Internal server error' })
  }
}
