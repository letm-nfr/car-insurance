import mongoose from 'mongoose'

const policySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    carDetails: {
      make: {
        type: String,
        required: true,
      },
      model: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
    },
    planDetails: {
      type: {
        type: String,
        required: true,
      },
      coverage: {
        type: String,
        required: true,
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
    },
    policyNumber: {
      type: String,
      unique: true,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUpto: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  },
  { timestamps: true }
)

// Generate policy number before saving
policySchema.pre('save', async function (next) {
  if (!this.policyNumber) {
    const count = await mongoose.model('Policy').countDocuments()
    this.policyNumber = `POL-${Date.now()}-${count + 1}`
  }
  next()
})

export default mongoose.model('Policy', policySchema)
