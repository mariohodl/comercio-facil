'use server';
import { auth } from '@/auth';
import { formatError } from '../utils';
import { connectToDatabase } from '../db';
import { IOrderReceptionInput } from '@/types';
import OrderReception, {IOrderReception} from '@/lib/db/models/orderReception.model';
import { OrderReceptionSchema } from '../validator';
import { revalidatePath } from 'next/cache'
import { PAGE_SIZE } from '@/lib/constants';


// CREATE
export async function createOrderReception(data: IOrderReceptionInput) {
    const session = await auth();
    if (!session) throw new Error('User not authenticated');
    const orderRecieved = OrderReceptionSchema.parse(data);
    try {
        await connectToDatabase()
    const orderReception = await OrderReception.create(orderRecieved);
    // revalidatePath('/admin/recepcion-de-compra');
    return {
        success: true,
        message: 'Order reception created successfully',
        data: JSON.parse(JSON.stringify(orderReception)),
    };
    } catch (error) {
    throw new Error(formatError(error));
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
        message: 'Product deleted successfully',
      }
    } catch (error) {
      return { success: false, message: formatError(error) }
    }
  }
  
  // GET ALL ORDERS FOR ADMIN
  export async function getAllOrdersReceivedForAdmin({
    query,
    page = 1,
    sort = 'latest',
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
            name: {
              $regex: query,
              $options: 'i',
            },
          }
        : {}
  
    const order: Record<string, 1 | -1> =
      sort === 'best-selling'
        ? { numSales: -1 }
        : sort === 'price-low-to-high'
          ? { price: 1 }
          : sort === 'price-high-to-low'
            ? { price: -1 }
            : sort === 'avg-customer-review'
              ? { avgRating: -1 }
              : { _id: -1 }
    const orders = await OrderReception.find({
      ...queryFilter,
    })
      .sort(order)
      .skip(pageSize * (Number(page) - 1))
      .limit(pageSize)
      .lean()
  
    const countProducts = await OrderReception.countDocuments({
      ...queryFilter,
    })
    return {
      orders: JSON.parse(JSON.stringify(orders)) as IOrderReception[],
      totalPages: Math.ceil(countProducts / pageSize),
      totalProducts: countProducts,
      from: pageSize * (Number(page) - 1) + 1,
      to: pageSize * (Number(page) - 1) + orders.length,
    }
  }