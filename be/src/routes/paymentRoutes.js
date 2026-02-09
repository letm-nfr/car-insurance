import express from 'express'
import {
  createPaymentIntent,
  confirmPayment,
  getPolicyDetails,
  getAllPolicies,
} from '../controllers/paymentController.js'

const router = express.Router()

router.post('/create-payment-intent', createPaymentIntent)
router.post('/confirm-payment', confirmPayment)
router.get('/policy/:policyId', getPolicyDetails)
router.get('/policies', getAllPolicies)

export default router
