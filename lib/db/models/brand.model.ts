import { Schema, model, models, Document } from 'mongoose'

export interface IBrand extends Document {
    _id: string
    name: string
    slug: string
    image: string
    status: boolean
    createdAt: Date
    updatedAt: Date
}

const brandSchema = new Schema<IBrand>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

const Brand = models.Brand || model<IBrand>('Brand', brandSchema)

export default Brand
