import { useState } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { CgProfile } from 'react-icons/cg'
import { MdDirectionsCar, MdVerifiedUser, MdSupportAgent } from 'react-icons/md'
import { IoArrowForward } from 'react-icons/io5'
import Login from './Login'
import Quotes from './Quotes'
import Menu from './Menu'
import MyPolicies from './MyPolicies'
import Notifications from './Notifications'

const carData = {
  toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
  honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  ford: ['F-150', 'Mustang', 'Explorer', 'Edge', 'Focus'],
  tesla: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  bmw: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
  chevrolet: ['Silverado', 'Equinox', 'Bolt', 'Traverse', 'Tahoe'],
  audi: ['A3', 'A4', 'Q3', 'Q5', 'A6'],
  volkswagen: ['Golf', 'Passat', 'Jetta', 'Tiguan', 'Atlas'],
}

const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i)

export default function Home() {
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showQuotes, setShowQuotes] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeMenuSection, setActiveMenuSection] = useState(null)
  const [user, setUser] = useState(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const availableModels = carMake ? carData[carMake.toLowerCase()] || [] : []

  const handleGetQuote = () => {
    if (carMake && carModel && carYear) {
      setShowQuotes(true)
    } else {
      alert('Please select car make, model, and year')
    }
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const handleMenuItemClick = (section) => {
    setActiveMenuSection(section)
    setIsMenuOpen(false)
  }

  if (activeMenuSection === 'policies') {
    return (
      <MyPolicies
        user={user}
        onBack={() => setActiveMenuSection(null)}
      />
    )
  }

  if (activeMenuSection === 'notifications') {
    return (
      <Notifications
        user={user}
        onBack={() => setActiveMenuSection(null)}
      />
    )
  }

  if (showQuotes) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
        {/* TopAppBar */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-[#0d141b] dark:text-white flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
          >
            <GiHamburgerMenu size={24} />
          </button>
          <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            InsuracePro
          </h2>
          <div className="flex w-12 items-center justify-end">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-primary dark:text-primary gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:opacity-80 transition-opacity"
                title={user.email}
              >
                <CgProfile size={24} />
                <span className="text-xs">✕</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#0d141b] dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
              >
                <CgProfile size={24} />
              </button>
            )}
          </div>
        </div>

        <Quotes
          carYear={carYear}
          carMake={carMake}
          carModel={carModel}
          onBack={() => setShowQuotes(false)}
          user={user}
        />

        {/* Menu Drawer */}
        <Menu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onMenuItemClick={handleMenuItemClick}
        />

        {/* Login Modal */}
        {showLoginModal && (
          <Login
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      {/* TopAppBar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-[#0d141b] dark:text-white flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
        >
          <GiHamburgerMenu size={24} />
        </button>
        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          InsuracePro
        </h2>
        <div className="flex w-12 items-center justify-end">
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-primary dark:text-primary gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:opacity-80 transition-opacity"
              title={user.email}
            >
              <CgProfile size={24} />
              <span className="text-xs">✕</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#0d141b] dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
            >
              <CgProfile size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 pb-10">
        {/* Hero Illustration */}
        <div className="px-4 pt-6 pb-2">
          <div
            className="w-full h-40 rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center relative overflow-hidden"
            data-alt="Abstract blue gradient pattern for car insurance"
          >
            <h2 className="text-[#0d141b] dark:text-white tracking-light text-[28px] font-bold leading-tight">
              {user ? `Welcome, ${user.email}!` : 'Calculate Your Premium'}
            </h2>
          </div>
        </div>

        {/* Body Text */}
        <p className="text-[#4c739a] dark:text-gray-400 text-base font-normal leading-normal pb-6 pt-1 px-4">
          {user ? 'You are logged in. Get a quick quote below.' : 'Get a quick quote in seconds. Enter your vehicle details below to see your personalized rates.'}
        </p>

        {/* Headline */}
        <h2 className="text-[#0d141b] dark:text-white tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-1 pt-5">
          Calculate Your Premium
        </h2>

        {/* Body Text */}
        <p className="text-[#4c739a] dark:text-gray-400 text-base font-normal leading-normal pb-6 pt-1 px-4">
          Get a quick quote in seconds. Enter your vehicle details below to see your personalized rates.
        </p>

        {/* Calculator Form */}
        <div className="space-y-1">
          {/* Car Make */}
          <div className="flex flex-col px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#0d141b] dark:text-white text-base font-semibold leading-normal pb-2">Car Make</p>
              <div className="relative">
                <select
                  value={carMake}
                  onChange={(e) => {
                    setCarMake(e.target.value)
                    setCarModel('')
                  }}
                  className="appearance-none w-full rounded-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-gray-700 bg-white dark:bg-gray-900 h-14 p-[15px] text-base font-normal leading-normal"
                >
                  <option value="">Select Make</option>
                  {Object.keys(carData).map((make) => (
                    <option key={make} value={make}>
                      {make.charAt(0).toUpperCase() + make.slice(1)}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-4 text-[#4c739a] pointer-events-none">
                  <MdDirectionsCar size={20} style={{ transform: 'rotate(90deg)' }} />
                </span>
              </div>
            </label>
          </div>

          {/* Car Model */}
          <div className="flex flex-col px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#0d141b] dark:text-white text-base font-semibold leading-normal pb-2">Car Model</p>
              <div className="relative">
                <select
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  disabled={!carMake}
                  className="appearance-none w-full rounded-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-gray-700 bg-white dark:bg-gray-900 h-14 p-[15px] text-base font-normal leading-normal disabled:opacity-50"
                >
                  <option value="">Select Model</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-4 text-[#4c739a] pointer-events-none">
                  <MdDirectionsCar size={20} style={{ transform: 'rotate(90deg)' }} />
                </span>
              </div>
            </label>
          </div>

          {/* Car Year */}
          <div className="flex flex-col px-4 py-3">
            <label className="flex flex-col w-full">
              <p className="text-[#0d141b] dark:text-white text-base font-semibold leading-normal pb-2">
                Year of Manufacture
              </p>
              <div className="relative">
                <select
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                  className="appearance-none w-full rounded-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-gray-700 bg-white dark:bg-gray-900 h-14 p-[15px] text-base font-normal leading-normal"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-4 text-[#4c739a] pointer-events-none">
                  <MdDirectionsCar size={20} style={{ transform: 'rotate(90deg)' }} />
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Get Quote Button */}
        <div className="px-4 py-8">
          <button
            onClick={handleGetQuote}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Get Free Quote</span>
            <IoArrowForward size={20} />
          </button>
        </div>

        {/* Trust Badge Section */}
        <div className="px-4 mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
            <MdVerifiedUser size={24} className="text-primary mb-2" />
            <p className="text-xs font-bold text-[#0d141b] dark:text-white">Secure Data</p>
            <p className="text-[10px] text-gray-500">256-bit encryption</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
            <MdSupportAgent size={24} className="text-primary mb-2" />
            <p className="text-xs font-bold text-[#0d141b] dark:text-white">24/7 Support</p>
            <p className="text-[10px] text-gray-500">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Login
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Menu Drawer */}
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMenuItemClick={handleMenuItemClick}
      />
    </div>
  )
}
