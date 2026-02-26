import { Schema, model, models, Document } from 'mongoose'

export interface IAICache extends Document {
    key: string // Unique identifier for the cached context (e.g., normalized category string)
    value: string // The cached result (e.g., extracted subcategory)
    type: string // Type of cache (e.g., 'subcategory_extraction')
    modelName?: string // The AI model used (e.g., 'gemini-1.5-flash')
    inputContext?: string // Raw context used (e.g., "Product Name | Description")
    hits: number // Counter for visibility
    createdAt: Date
    updatedAt: Date
}

const aiCacheSchema = new Schema<IAICache>(
    {
        key: {
            type: String,
            required: true,
            index: true,
        },
        value: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            index: true,
        },
        modelName: {
            type: String,
            required: false,
        },
        inputContext: {
            type: String,
            required: false,
        },
        hits: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
)

aiCacheSchema.index({ key: 1, type: 1 }, { unique: true })

const AICache = models.AICache || model<IAICache>('AICache', aiCacheSchema)

export default AICache
