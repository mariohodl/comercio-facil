import { Document, Model, model, models, Schema } from 'mongoose'

export interface IPhoneOTP extends Document {
  userId: string
  phone: string
  code: string
  expiresAt: Date
  verified: boolean
  createdAt: Date
}

const phoneOTPSchema = new Schema<IPhoneOTP>(
  {
    userId: { type: String, required: true },
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Auto-expire documents after 10 minutes using TTL index
phoneOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PhoneOTP =
  (models.PhoneOTP as Model<IPhoneOTP>) ||
  model<IPhoneOTP>('PhoneOTP', phoneOTPSchema)

export default PhoneOTP
