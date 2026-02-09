import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './utils/db.js'
import authRoutes from './routes/authRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
