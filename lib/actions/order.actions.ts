'use server';
import { auth } from '@/auth';
import { round2, formatError, getMXNow } from '../utils';
import { AVAILABLE_DELIVERY_DATES, PAGE_SIZE, ROL_ADMIN, ROL_SUPER_ADMIN } from '../constants'
import { OrderInputSchema } from '../validator';
import Order, { IOrder } from '../db/models/order.model';
import Customer from '../db/models/customer.model';
import { connectToDatabase } from '../db';
import { revalidatePath } from 'next/cache';
import { sendAskReviewOrderItems, sendPurchaseReceipt } from '@/emails'
import mongoose from 'mongoose'
import { paypal } from '../paypal';
import { Cart, IOrderList, OrderItem, ShippingAddress } from '@/types'
import { DateRange } from 'react-day-picker'
import Product from '../db/models/product.model'
import User from '../db/models/user.model'
import OrderReception from '../db/models/orderReception.model'
import Proveedor from '../db/models/proveedor.model'
import Store from '../db/models/store.model'
import Expense from '../db/models/expense.model'
// CREATE
export const createOrder = async (clientSideCart: Cart) => {
	try {
		await connectToDatabase();
		const session = await auth();
		if (!session) throw new Error('User not authenticated');
		// recalculate price and delivery date on the server

		const createdOrder = await createOrderFromCart(
			clientSideCart,
			session.user.id!
		);
		return {
			success: true,
			message: 'Order placed successfully',
			data: { orderId: createdOrder._id.toString() },
		};
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
};
export const createOrderFromCart = async (
	clientSideCart: Cart,
	userId: string
) => {
	const calculatedPrices = await calcDeliveryDateAndPrice({
		items: clientSideCart.items,
		shippingAddress: clientSideCart.shippingAddress,
		deliveryDateIndex: clientSideCart.deliveryDateIndex,
	});

	// Ensure all items have an image field (add fallback for items added before the fix)
	const itemsWithImages = clientSideCart.items.map(item => ({
		...item,
		image: item.image || `/images/${item.category.toLowerCase()}-category-product.jpg`
	}));

	const order = OrderInputSchema.parse({
		user: userId,
		items: itemsWithImages,
		shippingAddress: clientSideCart.shippingAddress,
		paymentMethod: clientSideCart.paymentMethod,
		itemsPrice: calculatedPrices.itemsPrice,
		shippingPrice: calculatedPrices.shippingPrice,
		taxPrice: calculatedPrices.taxPrice,
		totalPrice: calculatedPrices.totalPrice,
		expectedDeliveryDate: clientSideCart.expectedDeliveryDate,
		storeId: clientSideCart.storeId || undefined,
	});
	return await Order.create(order);
};
export async function getOrderById(orderId: string): Promise<IOrder> {
	await connectToDatabase();
	const order = await Order.findById(orderId);
	return JSON.parse(JSON.stringify(order));
}

export async function createPayPalOrder(orderId: string) {
	await connectToDatabase();
	try {
		const order = await Order.findById(orderId);
		if (order) {
			const paypalOrder = await paypal.createOrder(order.totalPrice);
			order.paymentResult = {
				id: paypalOrder.id,
				email_address: '',
				status: '',
				pricePaid: '0',
			};
			await order.save();
			return {
				success: true,
				message: 'PayPal order created successfully',
				data: paypalOrder.id,
			};
		} else {
			throw new Error('Order not found');
		}
	} catch (err) {
		return { success: false, message: formatError(err) };
	}
}

export async function approvePayPalOrder(
	orderId: string,
	data: { orderID: string }
) {
	await connectToDatabase();
	try {
		const order = await Order.findById(orderId).populate('user', 'email');
		if (!order) throw new Error('Order not found');

		const captureData = await paypal.capturePayment(data.orderID);
		if (
			!captureData ||
			captureData.id !== order.paymentResult?.id ||
			captureData.status !== 'COMPLETED'
		)
			throw new Error('Error in paypal payment');
		order.isPaid = true;
		order.paidAt = getMXNow();
		order.paymentResult = {
			id: captureData.id,
			status: captureData.status,
			email_address: captureData.payer.email_address,
			pricePaid:
				captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
		};
		await order.save();
		await sendPurchaseReceipt({ order });
		revalidatePath(`/account/orders/${orderId}`);
		return {
			success: true,
			message: 'Your order has been successfully paid by PayPal',
		};
	} catch (err) {
		return { success: false, message: formatError(err) };
	}
}

// GET
export async function getMyOrders({
	limit,
	page,
}: {
	limit?: number
	page: number
}) {
	limit = limit || PAGE_SIZE
	await connectToDatabase()
	const session = await auth()
	if (!session) {
		throw new Error('User is not authenticated')
	}
	const skipAmount = (Number(page) - 1) * limit
	const orders = await Order.find({
		user: session?.user?.id,
	})
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.limit(limit)
	const ordersCount = await Order.countDocuments({ user: session?.user?.id })

	return {
		data: JSON.parse(JSON.stringify(orders)),
		totalPages: Math.ceil(ordersCount / limit),
	}
}

export const calcDeliveryDateAndPrice = async ({
	items,
	shippingAddress,
	deliveryDateIndex,
}: {
	items: OrderItem[];
	shippingAddress: ShippingAddress | undefined;
	deliveryDateIndex?: number;
}) => {
	const itemsPrice = round2(
		items.reduce((acc, item) => acc + item.price * item.quantity, 0)
	);

	const deliveryDate =
		AVAILABLE_DELIVERY_DATES[
		deliveryDateIndex === undefined
			? AVAILABLE_DELIVERY_DATES.length - 1
			: deliveryDateIndex
		];
	const shippingPrice =
		!shippingAddress || !deliveryDate
			? undefined
			: deliveryDate.freeShippingMinPrice > 0 &&
				itemsPrice >= deliveryDate.freeShippingMinPrice
				? 0
				: deliveryDate.shippingPrice;

	const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15);

	const totalPrice = round2(
		itemsPrice +
		(shippingPrice ? round2(shippingPrice) : 0) +
		(taxPrice ? round2(taxPrice) : 0)
	);
	return {
		AVAILABLE_DELIVERY_DATES,
		deliveryDateIndex:
			deliveryDateIndex === undefined
				? AVAILABLE_DELIVERY_DATES.length - 1
				: deliveryDateIndex,
		itemsPrice,
		shippingPrice,
		taxPrice,
		totalPrice,
	};
};


// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange, storeId: string) {
	await connectToDatabase()

	const store = await Store.findOne({ slug: storeId })

	const ordersCount = await Order.countDocuments({
		storeId,
		createdAt: {
			$gte: date.from,
			$lte: date.to,
		},
	})
	const productsCount = await Product.countDocuments({
		store: storeId,
		createdAt: {
			$gte: date.from,
			$lte: date.to,
		},
	})
	const usersCount = store ? await User.countDocuments({
		'business.stores': store._id,
		createdAt: {
			$gte: date.from,
			$lte: date.to,
		},
	}) : 0

	// Now we can filter by storeId
	const suppliersCount = await Proveedor.countDocuments({
		storeId,
		createdAt: {
			$gte: date.from,
			$lte: date.to,
		},
	})

	const purchasesCount = await OrderReception.countDocuments({
		storeId
	})

	const totalPurchasesResult = await OrderReception.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$group: {
				_id: null,
				purchases: { $sum: '$total' },
			},
		},
		{ $project: { totalPurchases: { $ifNull: ['$purchases', 0] } } },
	])
	const totalPurchases = totalPurchasesResult[0] ? totalPurchasesResult[0].totalPurchases : 0

	const customersCount = await Customer.countDocuments({ storeId })

	const totalSalesResult = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$group: {
				_id: null,
				sales: { $sum: '$totalPrice' },
			},
		},
		{ $project: { totalSales: { $ifNull: ['$sales', 0] } } },
	])
	const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0

	const today = new Date()
	const sixMonthEarlierDate = new Date(
		today.getFullYear(),
		today.getMonth() - 5,
		1
	)
	const monthlySales = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: sixMonthEarlierDate,
				},
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
				totalSales: { $sum: '$totalPrice' },
			},
		},
		{
			$project: {
				_id: 0,
				label: '$_id',
				value: '$totalSales',
			},
		},

		{ $sort: { label: -1 } },
	])
	const topSalesCategories = await getTopSalesCategories(date, storeId)
	const topSalesProducts = await getTopSalesProducts(date, storeId)

	// Calculate Advanced Metrics for Business Intelligence
	// 1. Gross Profit Estimation (Utilidad Bruta)
	// We calculate this based on the items sold in the selected period
	const profitResult = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: { $gte: date.from, $lte: date.to }
			}
		},
		{ $unwind: '$items' },
		{
			$lookup: {
				from: 'products',
				localField: 'items.product',
				foreignField: '_id',
				as: 'productInfo'
			}
		},
		{ $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
		{
			$group: {
				_id: null,
				totalRevenue: { $sum: '$totalPrice' },
				totalCost: { $sum: { $multiply: [{ $ifNull: ['$productInfo.costPerUnit', 0] }, '$items.quantity'] } },
				grossSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
				totalUnitsSold: { $sum: '$items.quantity' }
			}
		}
	])

	const grossSales = profitResult[0]?.grossSales || 0
	const totalCost = profitResult[0]?.totalCost || 0
	const grossProfit = grossSales - totalCost
	const totalUnitsSold = profitResult[0]?.totalUnitsSold || 0

	// 2. Average Order Value (Ticket Promedio)
	const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0

	// 3. Inventory Value (Valor Total del Inventario Actual)
	const inventoryValueResult = await Product.aggregate([
		{ $match: { store: storeId } },
		{
			$group: {
				_id: null,
				totalValue: { $sum: { $multiply: [{ $toDouble: '$countInStock' }, { $toDouble: { $ifNull: ['$costPerUnit', 0] } }] } }
			}
		}
	])
	const inventoryValue = inventoryValueResult[0]?.totalValue || 0

	// 4. Operational Expenses (Gastos Operativos)
	const operationalExpensesResult = await Expense.aggregate([
		{
			$match: {
				storeId,
				date: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: '$amount' },
			},
		},
	])
	const operationalExpenses = operationalExpensesResult[0]?.total || 0
	const totalExpenses = totalPurchases + operationalExpenses

	const latestOrders = await Order.find({ storeId })
		.populate('user', 'name')
		.populate('customer', 'name')
		.sort({ createdAt: 'desc' })
		.limit(PAGE_SIZE)

	return {
		ordersCount,
		productsCount,
		usersCount,
		totalSales,
		monthlySales: JSON.parse(JSON.stringify(monthlySales)),
		salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date, storeId))),
		topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
		topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
		latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList[],
		totalPurchases,
		customersCount,
		suppliersCount,
		purchasesCount,
		purchaseChartData: JSON.parse(JSON.stringify(await getPurchaseChartData(date, storeId))),
		lowStockProducts: JSON.parse(JSON.stringify(await getLowStockProducts(storeId))),
		recentTransactions: JSON.parse(JSON.stringify(await getRecentTransactions(date, storeId))),
		topCustomers: JSON.parse(JSON.stringify(await getTopCustomers(date, storeId))),
		orderStats: JSON.parse(JSON.stringify(await getOrderStatistics(date, storeId))),
		// Refined metrics
		grossProfit,
		netProfit: grossProfit - operationalExpenses,
		avgOrderValue,
		inventoryValue,
		totalUnitsSold,
		totalExpenses,
		operationalExpenses,
	}
}

async function getTopCustomers(date: DateRange, storeId: string) {
	const result = await Order.aggregate([
		{
			$match: {
				storeId,
				customer: { $ne: null },
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$group: {
				_id: '$customer',
				totalSpent: { $sum: '$totalPrice' },
				orderCount: { $sum: 1 },
			},
		},
		{ $sort: { totalSpent: -1 } },
		{ $limit: 5 },
		{
			$lookup: {
				from: 'customers',
				localField: '_id',
				foreignField: '_id',
				as: 'customer',
			},
		},
		{ $unwind: '$customer' },
		{
			$project: {
				_id: 1,
				name: '$customer.name',
				email: '$customer.email',
				totalSpent: 1,
				orderCount: 1,
			},
		},
	])
	return result
}

async function getOrderStatistics(date: DateRange, storeId: string) {
	const result = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$project: {
				dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1 (Sun) - 7 (Sat)
				hour: { $hour: '$createdAt' },
			},
		},
		{
			$group: {
				_id: { day: '$dayOfWeek', hour: '$hour' },
				count: { $sum: 1 },
			},
		},
	])
	return result
}

async function getLowStockProducts(store: string) {
	const products = await Product.find({
		store,
		$expr: {
			$lte: [{ $toDouble: '$countInStock' }, { $toDouble: { $ifNull: ['$quantityAlert', 0] } }]
		}
	})
		.select('name countInStock images _id category price quantityAlert')
		.limit(5)
		.sort({ countInStock: 1 })
	return products
}

async function getRecentTransactions(date: DateRange, storeId: string) {
	// Fetch recent sales (Orders)
	const sales = await Order.find({
		storeId,
		createdAt: {
			$gte: date.from,
			$lte: date.to,
		},
	})
		.populate('user', 'name')
		.populate('customer', 'name')
		.select('createdAt totalPrice isPaid isDelivered user customer shippingAddress')
		.sort({ createdAt: -1 })
		.limit(10)

	// Fetch recent purchases (OrderReception)
	const purchases = await OrderReception.find({
		storeId,
		createdAt: {
			$gte: date.from,
			$lte: date.to,
		},
	})
		.select('createdAt total isPaid nameProvider')
		.sort({ createdAt: -1 })
		.limit(10)

	// Normalize and combine
	const transactions = [
		...sales.map((sale) => ({
			id: sale._id,
			date: sale.createdAt,
			name: (sale.customer as any)?.name || sale.shippingAddress?.fullName || 'Walk-in Customer',
			total: sale.totalPrice,
			status: sale.isDelivered ? 'Completed' : sale.isPaid ? 'Processing' : 'Pending',
			type: 'Sale',
		})),
		...purchases.map((purchase) => ({
			id: purchase._id,
			date: purchase.createdAt,
			name: purchase.nameProvider,
			total: purchase.total,
			status: purchase.isPaid ? 'Completed' : 'Pending',
			type: 'Purchase',
		})),
	]

	// Sort by date descending and take top 10
	return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
}

async function getPurchaseChartData(date: DateRange, storeId?: string) {
	const result = await OrderReception.aggregate([
		{
			$match: {
				...(storeId ? { storeId } : {}),
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$group: {
				_id: {
					year: { $year: '$createdAt' },
					month: { $month: '$createdAt' },
					day: { $dayOfMonth: '$createdAt' },
				},
				totalPurchases: { $sum: '$total' },
			},
		},
		{
			$project: {
				_id: 0,
				date: {
					$concat: [
						{ $toString: '$_id.year' },
						'/',
						{ $toString: '$_id.month' },
						'/',
						{ $toString: '$_id.day' },
					],
				},
				totalPurchases: 1,
			},
		},
		{ $sort: { date: 1 } },
	])

	return result
}

async function getSalesChartData(date: DateRange, storeId: string) {
	const result = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{
			$group: {
				_id: {
					year: { $year: '$createdAt' },
					month: { $month: '$createdAt' },
					day: { $dayOfMonth: '$createdAt' },
				},
				totalSales: { $sum: '$totalPrice' },
			},
		},
		{
			$project: {
				_id: 0,
				date: {
					$concat: [
						{ $toString: '$_id.year' },
						'/',
						{ $toString: '$_id.month' },
						'/',
						{ $toString: '$_id.day' },
					],
				},
				totalSales: 1,
			},
		},
		{ $sort: { date: 1 } },
	])

	return result
}

async function getTopSalesProducts(date: DateRange, storeId: string) {
	const result = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		{ $unwind: '$items' },
		{
			$group: {
				_id: '$items.name', // Grouping by name to avoid duplicates if ID differs but name is same
				productId: { $first: '$items.product' },
				image: { $first: '$items.image' },
				totalSales: {
					$sum: { $multiply: ['$items.quantity', '$items.price'] },
				},
				totalQuantity: { $sum: '$items.quantity' },
			},
		},
		{
			$lookup: {
				from: 'products',
				localField: 'productId',
				foreignField: '_id',
				as: 'productInfo',
			},
		},
		{ $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'units',
				localField: 'productInfo.unitId',
				foreignField: '_id',
				as: 'unitInfo',
			},
		},
		{ $unwind: { path: '$unitInfo', preserveNullAndEmptyArrays: true } },
		{
			$sort: {
				totalSales: -1,
			},
		},
		{ $limit: 6 },
		{
			$project: {
				_id: 0,
				id: '$productId',
				label: '$_id',
				image: '$image',
				value: '$totalSales',
				quantity: '$totalQuantity',
				unit: { $ifNull: ['$unitInfo.name', { $ifNull: ['$productInfo.unit', 'u.'] }] },
			},
		},
	])

	return result
}

async function getTopSalesCategories(date: DateRange, storeId: string, limit = 5) {
	const result = await Order.aggregate([
		{
			$match: {
				storeId,
				createdAt: {
					$gte: date.from,
					$lte: date.to,
				},
			},
		},
		// Step 1: Unwind orderItems array
		{ $unwind: '$items' },
		// Step 2: Group by productId to calculate total sales per product
		{
			$group: {
				_id: '$items.category',
				totalSales: { $sum: '$items.quantity' }, // Assume quantity field in orderItems represents units sold
			},
		},
		// Step 3: Sort by totalSales in descending order
		{ $sort: { totalSales: -1 } },
		// Step 4: Limit to top N products
		{ $limit: limit },
	])

	return result
}

// DELETE
export async function deleteOrder(id: string) {
	try {
		await connectToDatabase()
		const res = await Order.findByIdAndDelete(id)
		if (!res) throw new Error('Order not found')
		revalidatePath('/admin/orders')
		revalidatePath('/admin/sales')
		return {
			success: true,
			message: 'Order deleted successfully',
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

// GET ALL ORDERS
export async function getAllOrders({
	limit,
	page,
	storeId,
}: {
	limit?: number
	page: number
	storeId?: string
}) {
	limit = limit || PAGE_SIZE
	await connectToDatabase()
	const skipAmount = (Number(page) - 1) * limit
	const filter = storeId ? { storeId } : {}
	const orders = await Order.find(filter)
		.populate('user', 'name')
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.limit(limit)
	const ordersCount = await Order.countDocuments(filter)
	return {
		data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
		totalPages: Math.ceil(ordersCount / limit),
	}
}

export async function updateOrderToPaid(orderId: string) {
	try {
		await connectToDatabase()
		const order = await Order.findById(orderId).populate<{
			user: { email: string; name: string }
		}>('user', 'name email')
		if (!order) throw new Error('Order not found')
		if (order.isPaid) throw new Error('Order is already paid')
		order.isPaid = true
		order.paidAt = getMXNow()
		await order.save()
		if (!process.env.MONGODB_URI?.startsWith('mongodb://localhost'))
			await updateProductStock(order._id)
		if (order.user.email) await sendPurchaseReceipt({ order })
		revalidatePath(`/account/orders/${orderId}`)
		return { success: true, message: 'Order paid successfully' }
	} catch (err) {
		return { success: false, message: formatError(err) }
	}
}
const updateProductStock = async (orderId: string) => {
	const session = await mongoose.connection.startSession()

	try {
		session.startTransaction()
		const opts = { session }

		const order = await Order.findOneAndUpdate(
			{ _id: orderId },
			{ isPaid: true, paidAt: new Date() },
			opts
		)
		if (!order) throw new Error('Order not found')

		for (const item of order.items) {
			const product = await Product.findById(item.product).session(session)
			if (!product) throw new Error('Product not found')

			product.countInStock -= item.quantity
			await Product.updateOne(
				{ _id: product._id },
				{ countInStock: product.countInStock },
				opts
			)
		}
		await session.commitTransaction()
		session.endSession()
		return true
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}
export async function deliverOrder(orderId: string) {
	try {
		await connectToDatabase()
		const order = await Order.findById(orderId).populate<{
			user: { email: string; name: string }
		}>('user', 'name email')
		if (!order) throw new Error('Order not found')
		if (!order.isPaid) throw new Error('Order is not paid')
		order.isDelivered = true
		order.deliveredAt = new Date()
		order.fulfillmentStatus = 'DELIVERED'
		await order.save()
		if (order.user.email) await sendAskReviewOrderItems({ order })
		revalidatePath(`/account/orders/${orderId}`)
		revalidatePath(`/admin/sales`)
		return { success: true, message: 'Order delivered successfully' }
	} catch (err) {
		return { success: false, message: formatError(err) }
	}
}

export async function updateOrderFulfillmentStatus(orderId: string, status: string) {
	try {
		await connectToDatabase()
		const order = await Order.findById(orderId)
		if (!order) {
			console.error(`Order not found: ${orderId}`)
			throw new Error('Order not found')
		}


		order.fulfillmentStatus = status as any

		if (status === 'DELIVERED') {
			order.isDelivered = true
			order.deliveredAt = new Date()
		} else {
			// Optional: reset delivery status if moving back from DELIVERED
			order.isDelivered = false
			order.deliveredAt = undefined
		}

		await order.save()

		// Revalidate both the general sales path and the specific store path
		revalidatePath('/admin/sales')
		if (order.storeId) {
			revalidatePath(`/admin/${order.storeId}/sales`)
		}

		return { success: true, message: 'Fulfillment status updated successfully' }
	} catch (err) {
		console.error('Error updating fulfillment status:', err)
		return { success: false, message: formatError(err) }
	}
}

export async function getPOSOrders({
	storeId,
	limit = 10,
	page = 1,
	query = '',
	status = 'all',
}: {
	storeId: string
	limit?: number
	page?: number
	query?: string
	status?: string
}) {
	await connectToDatabase()
	const session = await auth()
	if (!session) throw new Error('User not authenticated')

	const skipAmount = (Number(page) - 1) * limit

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let filter: any = { storeId }

	// Role-based filtering
	if (session.user.role !== ROL_ADMIN && session.user.role !== ROL_SUPER_ADMIN) {
		// Sellers only see their own orders
		filter.user = session.user.id
	}

	// Status filtering
	if (status === 'paid') {
		filter.isPaid = true
	} else if (status === 'unpaid') {
		filter.isPaid = false
	}

	// Search query
	if (query) {
		const queryFilter: any[] = []
		if (mongoose.Types.ObjectId.isValid(query)) {
			queryFilter.push({ _id: new mongoose.Types.ObjectId(query) })
		} else {
			// Search by partial ID string if not a full ObjectId
			queryFilter.push({
				$expr: {
					$regexMatch: {
						input: { $toString: '$_id' },
						regex: query,
						options: 'i'
					}
				}
			})
		}
		if (queryFilter.length > 0) {
			filter = { ...filter, $or: queryFilter }
		}
	}



	const orders = await Order.find(filter)
		.populate({ path: 'user', select: 'name', model: User })
		.populate({ path: 'customer', select: 'name email', model: Customer })
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.limit(limit)

	const ordersCount = await Order.countDocuments(filter)

	return {
		data: JSON.parse(JSON.stringify(orders)),
		totalPages: Math.ceil(ordersCount / limit),
	}
}

export async function hasSales(storeId: string) {
	try {
		await connectToDatabase()
		const count = await Order.countDocuments({ storeId })
		return count > 0
	} catch (error) {
		console.error('Error checking if store has sales:', error)
		return false
	}
}