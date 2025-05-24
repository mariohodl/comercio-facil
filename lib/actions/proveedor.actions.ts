'use server';
import { auth } from '@/auth';
import { formatError } from '../utils';
import { connectToDatabase } from '../db';
import { IProveedorInput } from '@/types';
import Proveedor, { IProveedor } from '@/lib/db/models/proveedor.model';
import { ProveedorInputSchema } from '../validator';
import { revalidatePath } from 'next/cache'
import { PAGE_SIZE } from '@/lib/constants';

// CREATE
export async function createProveedor(data: IProveedorInput) {
    const session = await auth();
    if (!session) throw new Error('User not authenticated');
    const proveedorData = ProveedorInputSchema.parse(data);
    try {
      await connectToDatabase();
      const proveedor = await Proveedor.create(proveedorData);
      revalidatePath('/admin/proveedores');
      return {
          success: true,
          message: 'Proveedor created successfully',
          data: JSON.parse(JSON.stringify(proveedor)),
      };
    } catch (error) {
      throw new Error(formatError(error));
    }
}

  // DELETE
export async function deleteProveedor(id: string) {
    try {
      await connectToDatabase()
      const res = await Proveedor.findByIdAndDelete(id)
      if (!res) throw new Error('Proveedor not found')
      revalidatePath('/admin/proveedores')
      return {
        success: true,
        message: 'Proveedor deleted successfully',
      }
    } catch (error) {
      return { success: false, message: formatError(error) }
    }
  }

  // GET ALL PROVEEDORES FOR ADMIN
  export async function getAllProveedoresForAdmin({
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
    const proveedores = await Proveedor.find({
      ...queryFilter,
    })
      .sort(order)
      .skip(pageSize * (Number(page) - 1))
      .limit(pageSize)
      .lean()
  
    const countProveedores = await Proveedor.countDocuments({
      ...queryFilter,
    })
    return {
      proveedores: JSON.parse(JSON.stringify(proveedores)) as IProveedor[],
      totalPages: Math.ceil(countProveedores / pageSize),
      totalProducts: countProveedores,
      from: pageSize * (Number(page) - 1) + 1,
      to: pageSize * (Number(page) - 1) + proveedores.length,
    }
  }