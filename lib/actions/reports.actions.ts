'use server'

import { auth } from '@/auth';
import { formatError, formatDateWithHours } from '../utils';
import { connectToDatabase } from '../db';
import { IReportInput } from '@/types';
// import { ReportInputSchema } from '../validator';

import OrderReception from '@/lib/db/models/orderReception.model';
import Order from '@/lib/db/models/order.model';
import Report, { IReport } from '@/lib/db/models/report.model';

const createOrdersReport = (reportsData, dataToFilter) =>{ 
    const allTotalValue = reportsData.reduce((acumulador: number, obj:{ total: number, totalPrice: number}) => {
        const itemTotal = dataToFilter.type == 'order-received' ? obj.total : obj.totalPrice;
        return acumulador + itemTotal
    }, 0);

    
    const allSubTotalValue = dataToFilter.type == 'order-received' ? reportsData.reduce((acumulador: number, obj: {subtotal: number}) => {
        const itemSubTotal = obj.subtotal;
        return acumulador + itemSubTotal
    }, 0) : 0;
    
    const allProducts = []
    reportsData.forEach(reportItem => {
        if(dataToFilter.type == 'order-received'){
            reportItem.products.forEach(product => {
                const productFormatted = {
                    name: product.name,
                    productId: product.productId,
                    countInStock: product.countInStock,
                    price: product.listPrice,
                    category: product.category,
                    isValidProduct: true
                }
                // @ts-expect-error product not typed
                allProducts.push(productFormatted) 
            })
        }

        if(dataToFilter.type == 'sales'){
            reportItem.items.forEach(product => {
                const productFormatted = {
                    name: product.name,
                    productId: product.product,
                    countInStock: product.countInStock,
                    price: product.price,
                    category: product.category,
                    isValidProduct: true,
                }
                // @ts-expect-error product not typed
                allProducts.push(productFormatted) 
            })
        }
        
    })

    return {
        title: dataToFilter.title,
        type: dataToFilter.type,
        status: dataToFilter.status,
        allTotalValue,
        allSubTotalValue,
        allProducts,
        productsCount: allProducts.length,
        dateRangeFormatted: `${formatDateWithHours(dataToFilter.dateRange.from)} - ${formatDateWithHours(dataToFilter.dateRange.to)}`,
        dateRange: dataToFilter.dateRange,
        filtersUsed: dataToFilter,
        reportItems: reportsData
    }
}

// CREATE
export async function createNewReport(data: IReportInput) {
    const session = await auth();
    if (!session) throw new Error('User not authenticated');
    // console.log('DATA', data)
    await connectToDatabase();
    const isCompleted = data?.status === 'completed' ? true : false;
    // const isInProgress = data?.status === 'in-progress' ? true : false;

    if(data?.type === 'order-received'){
        const queryToFilter = {
            isPaid: isCompleted,
            createdAt: {
                $gte: new Date(data.dateRange.from),
                $lte: new Date(data.dateRange.to)
            }
        }
        

        try {
            await connectToDatabase();
            const queryFound = await OrderReception.find(queryToFilter)
            console.log('QUERY',queryFound)
            const newReportToSave = await createOrdersReport(queryFound, data)
            const reporte = await Report.create(newReportToSave);
            return {
                success: true,
                message: 'New Orders Recieved Report created successfully',
                data: JSON.parse(JSON.stringify(reporte)),
            };
          } catch (error) {
            throw new Error(formatError(error));
          }
    }

    if(data?.type == 'sales'){
        const queryToFilter = {
            isPaid: isCompleted,
            createdAt: {
                $gte: new Date(data.dateRange.from),
                $lte: new Date(data.dateRange.to)
            }
        }
        

        try {
            await connectToDatabase();
            const queryFound = await Order.find(queryToFilter)
            console.log('QUERY',queryFound)
            
            const newReportToSave = await createOrdersReport(queryFound, data)
            const reporte = await Report.create(newReportToSave);
            return {
                success: true,
                message: 'New Orders Recieved Report created successfully',
                data: JSON.parse(JSON.stringify(reporte)),
            };
          } catch (error) {
            throw new Error(formatError(error));
          }
    }
    
}

// Get Reports
export async function getAllReports() {

    await connectToDatabase()

    const reports = await Report.find({})
    const countReports = await Report.countDocuments({})

    return {
        reportes: JSON.parse(JSON.stringify(reports)) as IReport[],
        totalProducts: countReports,
    }
    
}

// GET ONE REPORT BY ID
export async function getReportById(reportId: string) {
	await connectToDatabase()
	const order = await Report.findById(reportId)
	return JSON.parse(JSON.stringify(order)) as IReport
}