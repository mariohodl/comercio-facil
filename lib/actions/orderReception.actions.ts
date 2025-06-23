'use server'
import { auth } from '@/auth'
import { formatError } from '../utils'
import { connectToDatabase } from '../db'
import { IOrderReceptionInput } from '@/types'
import OrderReception, {
	IOrderReception,
} from '@/lib/db/models/orderReception.model'
import Product, { IProduct } from '@/lib/db/models/product.model'

import { revalidatePath } from 'next/cache'
import { PAGE_SIZE } from '@/lib/constants'
import {  sendOrderReceptionSavedEmail } from '@/emails'

// CREATE
export async function createOrderReception(data: IOrderReceptionInput) {
	const orderReceptionToSave = await JSON.parse(JSON.stringify(data));
	const session = await auth()
	if (!session) throw new Error('User not authenticated')
	try {
		await connectToDatabase()
		const productBulk = Product.collection.initializeUnorderedBulkOp()

		for (const singleProduct of data.products) {
			// findSingleProduct
			let productFound = await Product.findOne({ productId: singleProduct.productId });
			const parsedProduct  = await JSON.parse(JSON.stringify(productFound)) as IProduct;
			if(productFound){
				singleProduct.listPrice = (Number(parsedProduct.listPrice) + Number(singleProduct.listPrice)) / 2;
				singleProduct.countInStock= Number(parsedProduct.countInStock) + Number(singleProduct.countInStock);
			}
			
			productBulk
				.find({ productId: singleProduct.productId })
				.upsert()
				.update({
					$set: {
						...singleProduct,
					},
				})

			productFound = null
		}

		productBulk
			.execute()
			.then((result) => {
				console.log(result)
			})
			.catch((error) => {
				console.log('Error-->', error)
				throw new Error(formatError(error))
			})

		const orderReception = await OrderReception.create(orderReceptionToSave)
		await sendOrderReceptionSavedEmail({order: orderReception});
		revalidatePath('/admin/recepcion-de-compra')
		return {
			success: true,
			message: 'Order reception created successfully',
			data: JSON.parse(JSON.stringify(orderReception)),
		}
	} catch (error) {
		console.log('Error-->', error)
		throw new Error(formatError(error))
	}
}

// DELETE
export async function deleteOrderReceived(id: string) {
	try {
		await connectToDatabase()
		const res = await OrderReception.findByIdAndDelete(id)
		if (!res) throw new Error('Product not found')
		revalidatePath('/admin/ordenes-de-compra')
		return {
			success: true,
			message: 'Order deleted successfully',
		}
	} catch (error) {
		return { success: false, message: formatError(error) }
	}
}

// GET ALL ORDERS FOR ADMIN
export async function getAllOrdersReceivedForAdmin({
	query,
	page = 1,
	// sort = 'latest',
	limit,
}: {
	query: string
	page?: number
	sort?: string
	limit?: number
}) {
	await connectToDatabase()

	const pageSize = limit || PAGE_SIZE
	const queryFilter =
		query && query !== 'all'
			? {
					nameProvider: {
						$regex: query,
						$options: 'i',
					},
				}
			: {}

	// const order: Record<string, 1 | -1> =
	// 	sort === 'best-selling'
	// 		? { numSales: -1 }
	// 		: sort === 'price-low-to-high'
	// 			? { price: 1 }
	// 			: sort === 'price-high-to-low'
	// 				? { price: -1 }
	// 				: sort === 'avg-customer-review'
	// 					? { avgRating: -1 }
	// 					: { _id: -1 }
	const orders = await OrderReception.find({
		...queryFilter,
	})
		// .sort(order)
		.skip(pageSize * (Number(page) - 1))
		.limit(pageSize)
		.lean()

	const countOrders = await OrderReception.countDocuments({
		...queryFilter,
	})
	orders.reverse()
	return {
		orders: JSON.parse(JSON.stringify(orders)) as IOrderReception[],
		totalPages: Math.ceil(countOrders / pageSize),
		totalOrders: countOrders,
		from: pageSize * (Number(page) - 1) + 1,
		to: pageSize * (Number(page) - 1) + orders.length,
	}
}

// GET ONE ORDER BY ID
export async function getOrderById(orderId: string) {
	await connectToDatabase()
	const order = await OrderReception.findById(orderId)
	return JSON.parse(JSON.stringify(order)) as IOrderReception
}


  export async function updateOrderReceptionToPaid(orderId: string) {
	try {
	  await connectToDatabase()
	  const order = await OrderReception.findById(orderId)
	  if (!order) throw new Error('OrderReception not found')
	  if (order.isPaid) throw new Error('OrderReception is already paid')
	  order.isPaid = true
	  order.paidAt = new Date()
	  await order.save()
	//   if (!process.env.MONGODB_URI?.startsWith('mongodb://localhost'))
		// await updateProductStock(order._id)
	//   if (order.user.email) await sendOrderReceptionSavedEmail({ order })
	  revalidatePath(`/admin/ordenes-de-compra`)
	  return { success: true, message: 'OrderReception paid successfully' }
	} catch (err) {
	  return { success: false, message: formatError(err) }
	}
  }