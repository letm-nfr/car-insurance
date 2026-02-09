import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendOtpEmail = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL || 'noreply@insurancepro.com',
      subject: 'Your Car Insurance Login OTP',
      html: `
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f6f7f8;">
          <div style="background-color: white; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #0d141b; margin: 0 0 10px 0;">Welcome to InsuracePro</h2>
            <p style="color: #4c739a; margin: 0 0 20px 0;">Your OTP for login is:</p>
            <div style="background-color: #137fec; color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #4c739a; margin: 20px 0 0 0;">This OTP will expire in 5 minutes.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    }

    await sgMail.send(msg)
    console.log('OTP email sent successfully to:', email)
    return true
  } catch (error) {
    console.error('Error sending email:', error.message)
    return false
  }
}

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
