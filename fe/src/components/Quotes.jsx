import { useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { MdDirectionsCar, MdCalendarToday, MdShield } from 'react-icons/md'
import Payment from './Payment'
import PolicyDetails from './PolicyDetails'

const generateQuotes = (carYear, carMake, carModel) => {
  const basePrices = [15000, 18000, 22000, 25000, 28000]
  const insuranceTypes = [
    { type: 'Basic Coverage', coverage: 'Third Party Liability' },
    { type: 'Standard Coverage', coverage: 'Third Party + Own Damage' },
    { type: 'Comprehensive', coverage: 'Full Coverage with Add-ons' },
    { type: 'Premium Plus', coverage: 'Comprehensive + Roadside Assist' },
    { type: 'Elite Coverage', coverage: 'Full + Personal Accident + Legal' },
  ]

  return basePrices.map((basePrice, index) => ({
    id: index + 1,
    type: insuranceTypes[index].type,
    coverage: insuranceTypes[index].coverage,
    price: basePrice + Math.floor(Math.random() * 10000),
    validity: '12 months',
    carYear,
    carMake,
    carModel,
  }))
}

export default function Quotes({ carYear, carMake, carModel, onBack, user }) {
  const [quotes, setQuotes] = useState(() =>
    generateQuotes(carYear, carMake, carModel)
  )
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [purchasedPolicy, setPurchasedPolicy] = useState(null)

  const handleBuyQuote = (quote) => {
    setSelectedQuote(quote)
  }

  const handlePaymentSuccess = (policy) => {
    setPurchasedPolicy(policy)
  }

  if (purchasedPolicy) {
    return (
      <PolicyDetails
        policy={purchasedPolicy}
        onBack={() => {
          setPurchasedPolicy(null)
          setSelectedQuote(null)
        }}
      />
    )
  }

  if (selectedQuote) {
    return (
      <div className="px-4 py-6">
        <Payment
          quote={selectedQuote}
          user={user}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => setSelectedQuote(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 pb-10">
      {/* Header with Back Button */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IoArrowBack size={24} className="text-primary" />
        </button>
        <div>
          <h2 className="text-[#0d141b] dark:text-white text-xl font-bold">
            Available Quotes
          </h2>
          <p className="text-[#4c739a] dark:text-gray-400 text-sm">
            {carYear} {carMake} {carModel}
          </p>
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="px-4 py-6 space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[#0d141b] dark:text-white font-bold text-lg mb-1">
                    {quote.type}
                  </h3>
                  <p className="text-[#4c739a] dark:text-gray-400 text-sm flex items-center gap-1">
                    <MdShield size={16} />
                    {quote.coverage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-2xl">
                    ₹{quote.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-[#4c739a] dark:text-gray-400">per year</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              {/* Car Details */}
              <div className="flex items-center gap-2 text-sm text-[#0d141b] dark:text-white">
                <MdDirectionsCar size={18} className="text-primary" />
                <span>
                  {quote.carYear} {quote.carMake} {quote.carModel}
                </span>
              </div>

              {/* Validity */}
              <div className="flex items-center gap-2 text-sm text-[#0d141b] dark:text-white">
                <MdCalendarToday size={18} className="text-primary" />
                <span>Validity: {quote.validity}</span>
              </div>

              {/* Benefits */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-[#0d141b] dark:text-white mb-2">
                  Benefits Included:
                </p>
                <ul className="text-xs text-[#4c739a] dark:text-gray-400 space-y-1">
                  <li>✓ Emergency roadside assistance</li>
                  <li>✓ Cashless claim settlement</li>
                  <li>✓ 24/7 customer support</li>
                  {quote.id > 2 && <li>✓ Personal accident cover</li>}
                  {quote.id > 3 && <li>✓ Loan protection coverage</li>}
                </ul>
              </div>
            </div>

            {/* Card Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
              <button
              onClick={() => user ? handleBuyQuote(quote) : onBack()}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
              {user ? 'Buy This Quote' : 'Login to Buy This Quote'}
              </button>
            </div>
            </div>
          ))}
          </div>

          {/* Info Section */}
      <div className="px-4 mt-4 space-y-2 text-center">
        <p className="text-xs text-[#4c739a] dark:text-gray-400">
          💡 Prices are indicative and may vary based on additional factors
        </p>
        <p className="text-xs text-[#4c739a] dark:text-gray-400">
          All quotes come with our 30-day money-back guarantee
        </p>
      </div>
    </div>
  )
}
