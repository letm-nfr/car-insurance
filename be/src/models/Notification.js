import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
    },
    type: {
      type: String,
      enum: ['payment_completed', 'policy_purchased', 'policy_approved', 'payment_failed'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
    },
    metadata: {
      policyNumber: String,
      carDetails: {
        make: String,
        model: String,
        year: Number,
      },
      planType: String,
      amount: Number,
      paymentStatus: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Notification', notificationSchema)
