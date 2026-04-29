import Stripe from 'stripe'
import Policy from '../models/Policy.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { isValidEmail, isValidAmount, isValidCarDetails } from '../utils/validation.js'
import { deleteFromCache, notificationCacheKeys } from '../utils/redis.js'
import { logger, logError } from '../utils/logger.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { email, amount, carDetails, planDetails } = req.body

    logger.debug({ email, amount }, 'createPaymentIntent: Received request')

    if (!email || !amount || !carDetails || !planDetails) {
      logger.warn({ email }, 'createPaymentIntent: Missing required fields')
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate input to prevent injection
    if (!isValidEmail(email)) {
      logger.warn({ email }, 'createPaymentIntent: Invalid email format')
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!isValidAmount(amount)) {
      logger.warn({ email, amount }, 'createPaymentIntent: Invalid amount')
      return res.status(400).json({ message: 'Invalid amount' })
    }

    if (!isValidCarDetails(carDetails)) {
      logger.warn({ email }, 'createPaymentIntent: Invalid car details')
      return res.status(400).json({ message: 'Invalid car details' })
    }

    // Amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100)

    // Create description for transaction
    const description = `Car Insurance Policy - ${carDetails.year} ${carDetails.make} ${carDetails.model} - ${planDetails.type}`

    logger.info({ email, amount, carDetails }, 'createPaymentIntent: Creating Stripe payment intent')

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr',
      description: description,
      statement_descriptor: 'INSURANCEPRO CAR INS',
      metadata: {
        email,
        carMake: carDetails.make,
        carModel: carDetails.model,
        carYear: carDetails.year,
        planType: planDetails.type,
        coverage: planDetails.coverage,
      },
    })

    logger.info({ email, paymentIntentId: paymentIntent.id }, 'createPaymentIntent: Payment intent created successfully')

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      description: description,
    })
  } catch (error) {
    logError(error, { context: 'createPaymentIntent', email: req.body?.email })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Confirm Payment and Save Policy
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, email, carDetails, planDetails, amount } = req.body

    logger.debug({ email, paymentIntentId }, 'confirmPayment: Received request')

    if (!paymentIntentId || !email || !carDetails || !planDetails) {
      logger.warn({ email, paymentIntentId }, 'confirmPayment: Missing required fields')
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate input to prevent injection
    if (!isValidEmail(email)) {
      logger.warn({ email }, 'confirmPayment: Invalid email format')
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!isValidAmount(amount)) {
      logger.warn({ email, amount }, 'confirmPayment: Invalid amount')
      return res.status(400).json({ message: 'Invalid amount' })
    }

    if (!isValidCarDetails(carDetails)) {
      logger.warn({ email }, 'confirmPayment: Invalid car details')
      return res.status(400).json({ message: 'Invalid car details' })
    }

    logger.info({ paymentIntentId }, 'confirmPayment: Verifying payment intent with Stripe')

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      logger.warn({ paymentIntentId, status: paymentIntent.status }, 'confirmPayment: Payment not completed')
      return res.status(400).json({ message: 'Payment not completed' })
    }

    // Get user ID from authenticated request or look up by email
    let userId = req.user?.userId

    if (!userId) {
      // Try to find user by email
      let user = await User.findOne({ email: email })
      
      // If user doesn't exist, create one
      if (!user) {
        user = new User({
          email: email,
          isVerified: false,
        })
        await user.save()
        logger.info({ email }, 'confirmPayment: New user created')
      }
      
      userId = user._id
    }

    logger.info({ email, userId, amount }, 'confirmPayment: Creating policy')

    // Create policy
    const policy = new Policy({
      userId,
      email,
      carDetails: {
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year,
      },
      planDetails: {
        type: planDetails.type,
        coverage: planDetails.coverage,
      },
      amount,
      paymentStatus: 'succeeded',
      stripePaymentIntentId: paymentIntentId,
    })

    await policy.save()

    logger.info({ policyId: policy._id, policyNumber: policy.policyNumber, email }, 'confirmPayment: Policy created successfully')

    // Create payment completed notification
    const paymentNotification = new Notification({
      userId,
      email,
      policyId: policy._id,
      type: 'payment_completed',
      title: 'Payment Completed',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} has been successfully processed for your ${carDetails.year} ${carDetails.make} ${carDetails.model} insurance policy.`,
      metadata: {
        policyNumber: policy.policyNumber,
        carDetails: {
          make: carDetails.make,
          model: carDetails.model,
          year: carDetails.year,
        },
        planType: planDetails.type,
        amount: amount,
        paymentStatus: 'succeeded',
      },
    })

    await paymentNotification.save()

    // Create policy purchased notification
    const policyNotification = new Notification({
      userId,
      email,
      policyId: policy._id,
      type: 'policy_purchased',
      title: 'Policy Purchased Successfully',
      message: `Your ${planDetails.type} insurance policy for ${carDetails.year} ${carDetails.make} ${carDetails.model} has been purchased. Policy Number: ${policy.policyNumber}. Coverage: ${planDetails.coverage}. Valid till ${new Date(policy.validUpto).toLocaleDateString('en-US')}.`,
      metadata: {
        policyNumber: policy.policyNumber,
        carDetails: {
          make: carDetails.make,
          model: carDetails.model,
          year: carDetails.year,
        },
        planType: planDetails.type,
        amount: amount,
        paymentStatus: 'succeeded',
      },
    })

    await policyNotification.save()

    // Clear Redis cache for user's notifications so fresh data is fetched next time
    await deleteFromCache(notificationCacheKeys.byUserId(userId))

    logger.info({ policyId: policy._id, email }, 'confirmPayment: Notifications created and cache cleared')

    return res.status(200).json({
      message: 'Payment successful',
      policy: {
        id: policy._id,
        policyNumber: policy.policyNumber,
        email: policy.email,
        carDetails: policy.carDetails,
        planDetails: policy.planDetails,
        amount: policy.amount,
        validFrom: policy.validFrom,
        validUpto: policy.validUpto,
        paymentStatus: policy.paymentStatus,
      },
    })
  } catch (error) {
    logError(error, { context: 'confirmPayment', email: req.body?.email, paymentIntentId: req.body?.paymentIntentId })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get Policy Details
export const getPolicyDetails = async (req, res) => {
  try {
    const { policyId } = req.params

    logger.debug({ policyId }, 'getPolicyDetails: Received request')

    if (!policyId) {
      logger.warn({ policyId }, 'getPolicyDetails: Policy ID is required')
      return res.status(400).json({ message: 'Policy ID is required' })
    }

    const policy = await Policy.findById(policyId)

    if (!policy) {
      logger.warn({ policyId }, 'getPolicyDetails: Policy not found')
      return res.status(404).json({ message: 'Policy not found' })
    }

    // Authorization: User can only access their own policy
    const userId = req.user?.userId
    const userEmail = req.user?.email

    if (userId) {
      // Check if policy belongs to user
      if (policy.userId && policy.userId.toString() !== userId) {
        logger.warn({ policyId, userId }, 'getPolicyDetails: Unauthorized access attempt')
        return res.status(403).json({ message: 'Unauthorized' })
      }
    } else if (userEmail) {
      // Fall back to email check
      if (policy.email !== userEmail) {
        logger.warn({ policyId, email: userEmail }, 'getPolicyDetails: Unauthorized access attempt')
        return res.status(403).json({ message: 'Unauthorized' })
      }
    }

    logger.info({ policyId }, 'getPolicyDetails: Policy details retrieved successfully')

    return res.status(200).json({
      policy: {
        id: policy._id,
        policyNumber: policy.policyNumber,
        email: policy.email,
        carDetails: policy.carDetails,
        planDetails: policy.planDetails,
        amount: policy.amount,
        paymentStatus: policy.paymentStatus,
        validFrom: policy.validFrom,
        validUpto: policy.validUpto,
        createdAt: policy.createdAt,
      },
    })
  } catch (error) {
    logError(error, { context: 'getPolicyDetails', policyId: req.params?.policyId })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get All Policies for User
export const getAllPolicies = async (req, res) => {
  try {
    // Prefer authenticated user from middleware
    let userId = req.user?.userId
    let userEmail = req.user?.email

    logger.debug({ userId, userEmail }, 'getAllPolicies: Received request')

    // If not authenticated but email provided in query, validate it
    if (!userId && req.query.email) {
      if (!isValidEmail(req.query.email)) {
        logger.warn({ email: req.query.email }, 'getAllPolicies: Invalid email format')
        return res.status(400).json({ message: 'Invalid email format' })
      }
      userEmail = req.query.email
    }

    // Require at least one identifier
    if (!userId && !userEmail) {
      logger.warn({ userId, userEmail }, 'getAllPolicies: Unauthorized - no identifier provided')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    let searchCriteria = {}
    if (userId) {
      searchCriteria.userId = userId
    }
    if (userEmail) {
      searchCriteria.email = userEmail
    }

    logger.info({ searchCriteria }, 'getAllPolicies: Fetching policies')

    const policies = await Policy.find(searchCriteria).sort({ createdAt: -1 })

    if (!policies || policies.length === 0) {
      logger.info({ searchCriteria }, 'getAllPolicies: No policies found')
      return res.status(200).json({
        policies: [],
        message: 'No policies found',
      })
    }

    const formattedPolicies = policies.map((policy) => ({
      id: policy._id,
      policyNumber: policy.policyNumber,
      email: policy.email,
      carDetails: policy.carDetails,
      planDetails: policy.planDetails,
      amount: policy.amount,
      paymentStatus: policy.paymentStatus,
      validFrom: policy.validFrom,
      validUpto: policy.validUpto,
      createdAt: policy.createdAt,
    }))

    logger.info({ count: formattedPolicies.length, email: userEmail }, 'getAllPolicies: Policies retrieved successfully')

    return res.status(200).json({
      policies: formattedPolicies,
      count: formattedPolicies.length,
    })
  } catch (error) {
    logError(error, { context: 'getAllPolicies', email: req.user?.email })
    return res.status(500).json({ message: 'Internal server error' })
  }
}
