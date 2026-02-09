import { useState, useEffect } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import { IoArrowBack } from 'react-icons/io5'

const API_BASE_URL = 'http://localhost:2005/api'

// Initialize Stripe with your publishable key
let stripePromise = null

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      'pk_test_51K3ExmSIhFhL0IRQ70R7a7cMX86xnwoWbQFXYKnwp0tw0LrkHa8CT0mvCypjTy5whMlfvPYvU9rxSfLFltikwoRe00ZEGydMlx'
    )
  }
  return stripePromise
}

function PaymentForm({
  quote,
  user,
  onPaymentSuccess,
  onBack,
  clientSecret,
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // Confirm the payment
      const { error: paymentError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        })

      if (paymentError) {
        setError(paymentError.message)
        setLoading(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const response = await axios.post(`${API_BASE_URL}/payment/confirm-payment`, {
          paymentIntentId: paymentIntent.id,
          email: user?.email || '',
          carDetails: {
            make: quote.carMake,
            model: quote.carModel,
            year: quote.carYear,
          },
          planDetails: {
            type: quote.type,
            coverage: quote.coverage,
          },
          amount: quote.price,
          token: localStorage.getItem('token'),
        })

        if (response.status === 200) {
          onPaymentSuccess(response.data.policy)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IoArrowBack size={24} className="text-primary" />
        </button>
        <div>
          <h2 className="text-[#0d141b] dark:text-white text-xl font-bold">
            Complete Payment
          </h2>
          <p className="text-[#4c739a] dark:text-gray-400 text-sm">
            ₹{quote.price.toLocaleString('en-IN')} • {quote.type}
          </p>
        </div>
      </div>

      {/* Quote Summary */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <p className="text-xs text-[#4c739a] dark:text-gray-400 mb-2">
          Payment Summary
        </p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-[#0d141b] dark:text-white">
              Plan Type:
            </span>
            <span className="text-sm font-semibold text-[#0d141b] dark:text-white">
              {quote.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#0d141b] dark:text-white">
              Coverage:
            </span>
            <span className="text-sm font-semibold text-[#0d141b] dark:text-white">
              {quote.coverage}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-[#0d141b] dark:text-white font-semibold">
              Total Amount:
            </span>
            <span className="text-lg font-bold text-primary">
              ₹{quote.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
      >
        {loading ? 'Processing...' : `Pay ₹${quote.price.toLocaleString('en-IN')}`}
      </button>

      {/* Info */}
      <p className="text-xs text-[#4c739a] dark:text-gray-400 text-center">
        💡 Use test card 4242 4242 4242 4242 for demo
      </p>
    </form>
  )
}

export default function Payment({ quote, user, onPaymentSuccess, onBack }) {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const stripePromise = getStripe()

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/payment/create-payment-intent`,
          {
            email: user?.email || '',
            amount: quote.price,
            carDetails: {
              make: quote.carMake,
              model: quote.carModel,
              year: quote.carYear,
            },
            planDetails: {
              type: quote.type,
              coverage: quote.coverage,
            },
          }
        )

        setClientSecret(response.data.clientSecret)
        setLoading(false)
      } catch (error) {
        console.error('Failed to create payment intent:', error)
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [quote, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#4c739a] dark:text-gray-400">Loading payment...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm
        quote={quote}
        user={user}
        onPaymentSuccess={onPaymentSuccess}
        onBack={onBack}
        clientSecret={clientSecret}
      />
    </Elements>
  )
}
