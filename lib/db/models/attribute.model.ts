import { Document, Model, model, models, Schema } from 'mongoose'

export interface IAttribute extends Document {
    _id: string
    name: string
    values: string[]
    store: string
    status: boolean
    createdAt: Date
    updatedAt: Date
}

const attributeSchema = new Schema<IAttribute>(
    {
        name: {
            type: String,
            required: true,
        },
        values: {
            type: [String],
            required: true,
        },
        store: {
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

const Attribute =
    (models.Attribute as Model<IAttribute>) ||
    model<IAttribute>('Attribute', attributeSchema)

export default Attribute
