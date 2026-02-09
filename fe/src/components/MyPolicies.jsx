import { useState, useEffect } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { MdDirectionsCar, MdCheckCircle, MdPending, MdClose, MdDownload } from 'react-icons/md'
import axios from 'axios'
import jsPDF from 'jspdf'

export default function MyPolicies({ user, onBack }) {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPolicy, setSelectedPolicy] = useState(null)

  useEffect(() => {
    fetchPolicies()
  }, [user])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const userEmail = user?.email

      if (!token && !userEmail) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const params = {}
      if (token) {
        params.token = token
      }
      if (userEmail) {
        params.email = userEmail
      }

      const response = await axios.get('http://localhost:2005/api/payment/policies', {
        params,
      })

      setPolicies(response.data.policies || [])
    } catch (err) {
      console.error('Error fetching policies:', err)
      setError(err.response?.data?.message || 'Failed to fetch policies')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysRemaining = (validUpto) => {
    const today = new Date()
    const endDate = new Date(validUpto)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    if (status === 'succeeded') {
      return <MdCheckCircle size={20} />
    }
    return <MdPending size={20} />
  }

  if (selectedPolicy) {
    return <PolicyDetailModal policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
  }

  return (
    <div className="fixed inset-0 bg-background-light dark:bg-background-dark z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IoArrowBack size={24} className="text-[#0d141b] dark:text-white" />
        </button>
        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold flex-1">
          My Policies
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchPolicies}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <MdDirectionsCar size={48} className="text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No policies found. Purchase an insurance policy to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {/* Policy Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Policy No.
                    </p>
                    <p className="text-[#0d141b] dark:text-white font-bold text-sm">
                      {policy.policyNumber}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      policy.paymentStatus
                    )}`}
                  >
                    {getStatusIcon(policy.paymentStatus)}
                    <span className="capitalize">{policy.paymentStatus}</span>
                  </div>
                </div>

                {/* Car Details */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MdDirectionsCar size={18} className="text-primary" />
                    <p className="text-[#0d141b] dark:text-white font-semibold">
                      {policy.carDetails.year} {policy.carDetails.make}{' '}
                      {policy.carDetails.model}
                    </p>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Plan Type
                    </p>
                    <p className="text-[#0d141b] dark:text-white font-semibold text-sm">
                      {policy.planDetails.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Coverage
                    </p>
                    <p className="text-[#0d141b] dark:text-white font-semibold text-sm">
                      {policy.planDetails.coverage}
                    </p>
                  </div>
                </div>

                {/* Validity */}
                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Valid From
                    </p>
                    <p className="text-[#0d141b] dark:text-white font-semibold text-sm">
                      {formatDate(policy.validFrom)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Valid Till
                    </p>
                    <p className="text-[#0d141b] dark:text-white font-semibold text-sm">
                      {formatDate(policy.validUpto)}
                    </p>
                  </div>
                </div>

                {/* Days Remaining */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Premium Paid
                    </p>
                    <p className="text-[#0d141b] dark:text-white font-bold text-lg">
                      ₹{policy.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold">
                      Days Remaining
                    </p>
                    <p className="text-primary font-bold text-lg">
                      {getDaysRemaining(policy.validUpto)}
                    </p>
                  </div>
                </div>

                {/* View Details Button */}
                <button 
                  onClick={() => setSelectedPolicy(policy)}
                  className="w-full mt-4 py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PolicyDetailModal({ policy, onClose }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDaysRemaining = (validUpto) => {
    const today = new Date()
    const endDate = new Date(validUpto)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const calculateValidityMonths = (validFrom, validUpto) => {
    const start = new Date(validFrom)
    const end = new Date(validUpto)
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    return months
  }

  const generatePDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 15

      // Header with color
      pdf.setFillColor(19, 127, 236)
      pdf.rect(0, 0, pageWidth, 30, 'F')

      // Title
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text('InsuracePro', pageWidth / 2, 12, { align: 'center' })
      pdf.setFontSize(10)
      pdf.text('Insurance Policy Document', pageWidth / 2, 20, { align: 'center' })

      // Reset text color
      pdf.setTextColor(0, 0, 0)
      yPosition = 40

      // Policy Number Section
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Policy Details', 15, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Policy Number:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(policy.policyNumber, 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Status:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(policy.paymentStatus.charAt(0).toUpperCase() + policy.paymentStatus.slice(1), 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Created On:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(formatDate(policy.createdAt), 80, yPosition)
      yPosition += 15

      // Vehicle Information Section
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Vehicle Information', 15, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Make:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(policy.carDetails.make, 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Model:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(policy.carDetails.model, 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Year:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(String(policy.carDetails.year), 80, yPosition)
      yPosition += 15

      // Coverage Information Section
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Coverage Information', 15, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Plan Type:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(policy.planDetails.type, 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Coverage:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(policy.planDetails.coverage, 80, yPosition)
      yPosition += 15

      // Validity Period Section
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Validity Period', 15, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Valid From:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(formatDate(policy.validFrom), 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Valid Till:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(formatDate(policy.validUpto), 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Validity Duration:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${calculateValidityMonths(policy.validFrom, policy.validUpto)} months`, 80, yPosition)
      yPosition += 8

      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Days Remaining:', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${getDaysRemaining(policy.validUpto)} days`, 80, yPosition)
      yPosition += 15

      // Premium Amount Section
      pdf.setFillColor(245, 247, 250)
      pdf.rect(15, yPosition - 5, pageWidth - 30, 20, 'F')
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Premium Amount', 15, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(16)
      pdf.text(`₹${policy.amount.toLocaleString('en-IN')}`, 15, yPosition + 10)
      yPosition += 25

      // Footer
      pdf.setFontSize(9)
      pdf.setTextColor(150, 150, 150)
      pdf.text('This is an electronically generated document. No signature is required.', pageWidth / 2, pageHeight - 15, {
        align: 'center',
      })
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      })

      // Download the PDF
      pdf.save(`InsuracePro_Policy_${policy.policyNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-background-light dark:bg-background-dark z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold">Policy Details</h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MdClose size={24} className="text-[#0d141b] dark:text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        {/* Policy Number & Status */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                POLICY NUMBER
              </p>
              <p className="text-[#0d141b] dark:text-white font-bold text-lg">
                {policy.policyNumber}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                policy.paymentStatus === 'succeeded'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {policy.paymentStatus === 'succeeded' ? (
                <MdCheckCircle size={16} />
              ) : (
                <MdPending size={16} />
              )}
              <span className="capitalize">{policy.paymentStatus}</span>
            </div>
          </div>
          <p className="text-xs text-[#4c739a] dark:text-gray-400">
            Created on {formatDate(policy.createdAt)}
          </p>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-[#0d141b] dark:text-white font-bold mb-4 flex items-center gap-2">
            <MdDirectionsCar className="text-primary" size={20} />
            Vehicle Information
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                  MAKE
                </p>
                <p className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.carDetails.make}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                  MODEL
                </p>
                <p className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.carDetails.model}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                YEAR OF MANUFACTURE
              </p>
              <p className="text-[#0d141b] dark:text-white font-semibold">
                {policy.carDetails.year}
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Information */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-[#0d141b] dark:text-white font-bold mb-4">Coverage Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                PLAN TYPE
              </p>
              <p className="text-[#0d141b] dark:text-white font-semibold text-lg">
                {policy.planDetails.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                COVERAGE
              </p>
              <p className="text-[#0d141b] dark:text-white font-semibold">
                {policy.planDetails.coverage}
              </p>
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h3 className="text-[#0d141b] dark:text-white font-bold mb-4">Validity Period</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                  VALID FROM
                </p>
                <p className="text-[#0d141b] dark:text-white font-semibold">
                  {formatDate(policy.validFrom)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                  VALID TILL
                </p>
                <p className="text-[#0d141b] dark:text-white font-semibold">
                  {formatDate(policy.validUpto)}
                </p>
              </div>
            </div>
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                VALIDITY DURATION
              </p>
              <p className="text-[#0d141b] dark:text-white font-bold">
                {calculateValidityMonths(policy.validFrom, policy.validUpto)} months
              </p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-1">
                DAYS REMAINING
              </p>
              <p className="text-primary font-bold text-lg">
                {getDaysRemaining(policy.validUpto)} days
              </p>
            </div>
          </div>
        </div>

        {/* Premium Amount */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold mb-2">
            PREMIUM AMOUNT
          </p>
          <p className="text-[#0d141b] dark:text-white font-bold text-3xl">
            ₹{policy.amount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button 
            onClick={generatePDF}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <MdDownload size={20} />
            Download Policy Document
          </button>
        </div>
      </div>
    </div>
  )
}
