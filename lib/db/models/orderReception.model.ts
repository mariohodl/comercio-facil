import { IOrderReceptionInput } from '@/types'
import { Document, Model, model, models, Schema } from 'mongoose'

export interface IOrderReception extends Document, IOrderReceptionInput {
	_id: string
	storeId?: string
	createdAt: Date
	updatedAt: Date
}

const orderReceptionSchema = new Schema<IOrderReception>(
	{
		nameProvider: { type: String, required: true },
		clave: { type: String, required: true },
		facturaNumber: { type: String, required: true },
		createdAt: { type: Date, default: Date.now },
		rfc: { type: String, required: true },
		observations: { type: String },
		isPaid: { type: Boolean, default: false, required: true },
		paidAt: { type: Date },
		products: [
			{
				name: { type: String, required: true },
				productId: { type: String, required: true },
				countInStock: { type: Number, required: true },
				listPrice: { type: Number, required: true },
				category: { type: String, required: true },
			},
		],
		subtotal: { type: Number, required: true },
		total: { type: Number, required: true },
		iva: { type: Number, required: true },
		storeId: { type: String },
	},
	{
		timestamps: true,
	}
)

const OrderReception =
	(models.OrderReception as Model<IOrderReception>) ||
	model<IOrderReception>('OrderReception', orderReceptionSchema)

export default OrderReception
