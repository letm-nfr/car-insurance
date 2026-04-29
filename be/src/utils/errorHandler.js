/**
 * Error Handler Utility
 * Prevents sensitive information leakage in error responses
 */

/**
 * Sanitize error messages to prevent information disclosure
 * @param {Error} error - Error object
 * @returns {string} - Safe error message
 */
export const sanitizeErrorMessage = (error) => {
  const message = error.message || 'An error occurred'
  
  // Don't expose internal error details to client
  // Log them server-side only
  if (message.includes('MongoError') || 
      message.includes('ValidationError') ||
      message.includes('CastError') ||
      message.includes('SyntaxError')) {
    return 'An error occurred while processing your request'
  }
  
  // List of safe error messages to expose
  const safeMessages = [
    'Email is required',
    'OTP is required',
    'OTP has expired',
    'Invalid OTP',
    'User not found',
    'Invalid token',
    'Unauthorized',
    'Policy not found',
    'Notification not found',
    'Payment not completed',
    'Missing required fields',
  ]
  
  // Only expose whitelisted messages
  if (safeMessages.some(safe => message.includes(safe))) {
    return message
  }
  
  // Default safe message
  return 'An error occurred while processing your request'
}

/**
 * Create safe error response for client
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message (should be safe)
 * @returns {object} - Response object
 */
export const createErrorResponse = (statusCode, message) => {
  return {
    status: statusCode,
    message: sanitizeErrorMessage(new Error(message)),
  }
}

export default {
  sanitizeErrorMessage,
  createErrorResponse,
}
