import { IOrderInput } from '@/types';
import { Document, Model, model, models, Schema } from 'mongoose';

export interface IOrder extends Document, IOrderInput {
	fulfillmentType: 'IN_STORE' | 'PICKUP_LATER' | 'DELIVERY';
	fulfillmentStatus: 'PENDING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
	paymentSplits?: { method: string; amount: number }[];
	customer?: string;
	_id: string;
	createdAt: Date;
	updatedAt: Date;
	storeId?: string;
}

const orderSchema = new Schema<IOrder>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		customer: {
			type: Schema.Types.ObjectId,
			ref: 'Customer',
		},
		fulfillmentType: {
			type: String,
			enum: ['IN_STORE', 'PICKUP_LATER', 'DELIVERY'],
			default: 'IN_STORE',
		},
		fulfillmentStatus: {
			type: String,
			enum: ['PENDING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'],
			default: 'PENDING',
		},
		items: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				clientId: { type: String, required: true },
				name: { type: String, required: true },
				slug: { type: String, required: true },
				image: { type: String, required: true },
				category: { type: String, required: true },
				price: { type: Number, required: true },
				countInStock: { type: Number, required: true },
				quantity: { type: Number, required: true },
				size: { type: String },
				color: { type: String },
			},
		],
		shippingAddress: {
			fullName: { type: String, required: true },
			street: { type: String, required: true },
			city: { type: String, required: true },
			postalCode: { type: String, required: true },
			country: { type: String, required: true },
			province: { type: String, required: true },
			phone: { type: String, required: true },
		},
		expectedDeliveryDate: { type: Date, required: true },
		paymentMethod: { type: String, required: true },
		paymentSplits: [
			{
				method: { type: String, required: true },
				amount: { type: Number, required: true },
			},
		],
		paymentResult: { id: String, status: String, email_address: String },
		itemsPrice: { type: Number, required: true },
		shippingPrice: { type: Number, required: true },
		taxPrice: { type: Number, required: true },
		totalPrice: { type: Number, required: true },
		isPaid: { type: Boolean, required: true, default: false },
		paidAt: { type: Date },
		isDelivered: { type: Boolean, required: true, default: false },
		deliveredAt: { type: Date },
		isRounded: { type: Boolean, default: false },
		amountRounded: { type: Number, default: 0 },
		storeId: { type: String },
		createdAt: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
	}
);

if (models.Order && !models.Order.schema.path('customer')) {
	delete (models as any).Order;
}

const Order =
	(models.Order as Model<IOrder>) || model<IOrder>('Order', orderSchema);

export default Order;
