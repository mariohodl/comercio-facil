import { Schema, model, models, Document } from 'mongoose'

export interface IContact extends Document {
    name: string
    email: string
    subject: string
    message: string
    status: 'pending' | 'resolved'
    createdAt: Date
    updatedAt: Date
}

const contactSchema = new Schema<IContact>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    },
    {
        timestamps: true,
    }
)

const Contact = models.Contact || model<IContact>('Contact', contactSchema)

export default Contact
