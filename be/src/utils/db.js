import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { logger, logError } from './logger.js'

dotenv.config()

export const connectDB = async () => {
  try {
    logger.info({ uri: process.env.MONGODB_URI }, 'connectDB: Attempting to connect to MongoDB')
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    logger.info('connectDB: MongoDB connected successfully')
  } catch (error) {
    logError(error, { context: 'connectDB', uri: process.env.MONGODB_URI })
    process.exit(1)
  }
}
