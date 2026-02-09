import { Document, Model, model, models, Schema } from 'mongoose'

export interface IAttribute extends Document {
    _id: string
    name: string
    values: string[]
    storeId?: string
    isGlobal: boolean
    isApproved: boolean
    industry: string
    status: boolean
    createdAt: Date
    updatedAt: Date
}

const attributeSchema = new Schema<IAttribute>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        values: {
            type: [String],
            required: true,
        },
        storeId: {
            type: String,
            required: false,
        },
        isGlobal: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        industry: {
            type: String,
            required: true,
            default: 'general',
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

// Ensure uniqueness within industry for global attributes, or within store for private ones
attributeSchema.index({ name: 1, industry: 1, storeId: 1 }, { unique: true })

// In development, Next.js hot reloading can cause issues with re-registering models.
// Clearing the cached model ensures that schema changes are applied correctly.
if (process.env.NODE_ENV !== 'production' && models.Attribute) {
    delete (models as any).Attribute
}

const Attribute =
    (models.Attribute as Model<IAttribute>) ||
    model<IAttribute>('Attribute', attributeSchema)

export default Attribute
