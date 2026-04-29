/**
 * Input Validation Utilities
 * Prevents injection attacks and validates data format
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid OTP format
 */
export const isValidOtp = (otp) => {
  return /^\d{6}$/.test(otp)
}

/**
 * Sanitize string input (basic sanitization)
 * Prevents NoSQL injection by validating input doesn't contain dangerous patterns
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return input
  }
  
  // Remove potentially dangerous characters for NoSQL injection
  return input
    .trim()
    .replace(/[{}"$]/g, '') // Remove MongoDB operators like {, }, ", $
    .substring(0, 500) // Limit length
}

/**
 * Validate car details object
 * @param {object} carDetails - Car details object
 * @returns {boolean} - True if valid
 */
export const isValidCarDetails = (carDetails) => {
  if (!carDetails || typeof carDetails !== 'object') return false
  
  const { make, model, year } = carDetails
  
  // Validate year is a number between 1900 and current year + 1
  const currentYear = new Date().getFullYear()
  const yearNum = parseInt(year)
  
  return (
    typeof make === 'string' && make.length > 0 && make.length <= 100 &&
    typeof model === 'string' && model.length > 0 && model.length <= 100 &&
    !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1
  )
}

/**
 * Validate amount (payment)
 * @param {number} amount - Amount to validate
 * @returns {boolean} - True if valid
 */
export const isValidAmount = (amount) => {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0 && num <= 10000000 // Max 1 crore INR
}

/**
 * Validate plan details
 * @param {object} planDetails - Plan details object
 * @returns {boolean} - True if valid
 */
export const isValidPlanDetails = (planDetails) => {
  if (!planDetails || typeof planDetails !== 'object') return false
  
  const { type, coverage } = planDetails
  const validTypes = ['basic', 'standard', 'premium', 'comprehensive']
  
  return (
    validTypes.includes(type) &&
    types === 'string' && coverage.length > 0 && coverage.length <= 1000
  )
}

export default {
  isValidEmail,
  isValidOtp,
  sanitizeString,
  isValidCarDetails,
  isValidAmount,
  isValidPlanDetails,
}
