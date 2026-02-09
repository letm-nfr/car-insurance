import { useState } from 'react'
import { CgProfile } from 'react-icons/cg'
import { IoArrowBack } from 'react-icons/io5'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:2005/api'

export default function Login({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email,
      })
      
      if (response.status === 200) {
        setShowOtpInput(true)
        setError('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp,
      })

      if (response.status === 200) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        alert('Logged in successfully!')
        onLoginSuccess(response.data.user)
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-96 max-w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#0d141b] dark:text-white text-xl font-bold flex items-center gap-2">
            <CgProfile size={24} />
            Login
          </h2>
          <button
            onClick={onClose}
            className="text-[#4c739a] hover:text-primary"
          >
            ✕
          </button>
        </div>

        {/* Email Section */}
        <div className="mb-6">
          <label className="block text-[#0d141b] dark:text-white text-sm font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={showOtpInput}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-[#cfdbe7] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d141b] dark:text-white p-3 text-base focus:outline-0 focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* OTP Input */}
        {showOtpInput && (
          <div className="mb-6">
            <label className="block text-[#0d141b] dark:text-white text-sm font-semibold mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full rounded-xl border border-[#cfdbe7] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d141b] dark:text-white p-3 text-base text-center text-2xl letter-spacing tracking-widest focus:outline-0 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Send OTP Button */}
        {!showOtpInput && (
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 mb-4"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        )}

        {/* Verify OTP Button */}
        {showOtpInput && (
          <>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 mb-3"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button
              onClick={() => {
                setShowOtpInput(false)
                setOtp('')
                setError('')
              }}
              className="w-full h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-[#0d141b] dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <IoArrowBack size={18} />
              Back
            </button>
          </>
        )}

        {/* Close Button */}
        {!showOtpInput && (
          <button
            onClick={onClose}
            className="w-full h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-[#0d141b] dark:text-white font-bold rounded-xl transition-all"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
