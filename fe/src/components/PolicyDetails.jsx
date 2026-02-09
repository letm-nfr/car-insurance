import { IoArrowBack } from 'react-icons/io5'
import { MdCheckCircle, MdDirectionsCar, MdShield, MdCalendarToday, MdAttachMoney } from 'react-icons/md'

export default function PolicyDetails({ policy, onBack }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col flex-1 pb-10">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IoArrowBack size={24} className="text-primary" />
        </button>
        <div>
          <h2 className="text-[#0d141b] dark:text-white text-xl font-bold">
            Policy Purchased Successfully!
          </h2>
          <p className="text-[#4c739a] dark:text-gray-400 text-sm">
            Your insurance is now active
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Success Banner */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <MdCheckCircle size={28} className="text-green-600" />
          <div>
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Payment Successful
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Your policy is now active and ready to use
            </p>
          </div>
        </div>

        {/* Policy Number Card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
          <p className="text-xs text-[#4c739a] dark:text-gray-400 mb-1">
            Policy Number
          </p>
          <p className="text-[#0d141b] dark:text-white text-2xl font-bold font-mono">
            {policy.policyNumber}
          </p>
        </div>

        {/* Policy Details Sections */}
        <div className="space-y-4">
          {/* Car Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-[#0d141b] dark:text-white font-semibold mb-3 flex items-center gap-2">
              <MdDirectionsCar size={20} className="text-primary" />
              Vehicle Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Make:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.carDetails.make}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Model:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.carDetails.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Year:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.carDetails.year}
                </span>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-[#0d141b] dark:text-white font-semibold mb-3 flex items-center gap-2">
              <MdShield size={20} className="text-primary" />
              Coverage Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Plan Type:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.planDetails.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Coverage:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {policy.planDetails.coverage}
                </span>
              </div>
            </div>
          </div>

          {/* Validity Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-[#0d141b] dark:text-white font-semibold mb-3 flex items-center gap-2">
              <MdCalendarToday size={20} className="text-primary" />
              Validity Period
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Valid From:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {formatDate(policy.validFrom)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Valid Until:</span>
                <span className="text-[#0d141b] dark:text-white font-semibold">
                  {formatDate(policy.validUpto)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-[#0d141b] dark:text-white font-semibold mb-3 flex items-center gap-2">
              <MdAttachMoney size={20} className="text-primary" />
              Payment Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Amount Paid:</span>
                <span className="text-[#0d141b] dark:text-white font-bold text-lg">
                  ₹{policy.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4c739a] dark:text-gray-400">Status:</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                  {policy.paymentStatus.charAt(0).toUpperCase() +
                    policy.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              📧 A confirmation email has been sent to{' '}
              <span className="font-semibold">{policy.email}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <button
            onClick={onBack}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Get Another Quote
          </button>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center space-y-2">
          <p className="text-xs text-[#4c739a] dark:text-gray-400">
            🎉 Thank you for choosing InsuracePro
          </p>
          <p className="text-xs text-[#4c739a] dark:text-gray-400">
            For support, call us at 1800-123-4567 or email support@insurancepro.com
          </p>
        </div>
      </div>
    </div>
  )
}
