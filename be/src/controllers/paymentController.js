import Stripe from 'stripe'
import Policy from '../models/Policy.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { email, amount, carDetails, planDetails } = req.body

    if (!email || !amount || !carDetails || !planDetails) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100)

    // Create description for transaction
    const description = `Car Insurance Policy - ${carDetails.year} ${carDetails.make} ${carDetails.model} - ${planDetails.type}`

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

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      description: description,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Confirm Payment and Save Policy
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, email, carDetails, planDetails, amount, token } =
      req.body

    if (!paymentIntentId || !email || !carDetails || !planDetails) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' })
    }

    // Get user ID from token
    let userId = null
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.userId
      } catch (err) {
        console.log('Token verification failed:', err.message)
      }
    }

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
    console.error('Confirm payment error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Get Policy Details
export const getPolicyDetails = async (req, res) => {
  try {
    const { policyId } = req.params

    if (!policyId) {
      return res.status(400).json({ message: 'Policy ID is required' })
    }

    const policy = await Policy.findById(policyId)

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' })
    }

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
    console.error('Get policy details error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Get All Policies for User
export const getAllPolicies = async (req, res) => {
  try {
    const { email, token } = req.query

    if (!email && !token) {
      return res.status(400).json({ message: 'Email or token is required' })
    }

    let searchCriteria = {}

    // Get user ID from token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        searchCriteria.userId = decoded.userId
      } catch (err) {
        console.log('Token verification failed, using email:', err.message)
        if (email) {
          searchCriteria.email = email
        } else {
          return res.status(401).json({ message: 'Invalid token' })
        }
      }
    } else {
      searchCriteria.email = email
    }

    const policies = await Policy.find(searchCriteria).sort({ createdAt: -1 })

    if (!policies || policies.length === 0) {
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

    return res.status(200).json({
      policies: formattedPolicies,
      count: formattedPolicies.length,
    })
  } catch (error) {
    console.error('Get all policies error:', error)
    return res.status(500).json({ message: error.message })
  }
}
