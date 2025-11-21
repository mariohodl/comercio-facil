'use client'
import {
  FileText,
  RefreshCw,
  Gift,
  ShieldCheck,
  Layers,
  Clock,
  Wallet,
  Hash,
  Users,
  ShoppingCart,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { calculatePastDate, formatCurrency, formatDateTime } from '@/lib/utils'

import React, { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { getOrderSummary } from '@/lib/actions/order.actions'
import { CalendarDateRangePicker } from './date-range-picker'
import { IOrderList } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import SummaryCard from './summary-card'
import SalesPurchaseChart from './sales-purchase-chart'
import TopSellingProducts from './top-selling-products'
import LowStockProducts from './low-stock-products'
import RecentSalesList from './recent-sales-list'
import SalesStaticsChart from './sales-statics-chart'
import RecentTransactionsTable from './recent-transactions-table'
import TopCustomers from './top-customers'
import TopCategoriesChart from './top-categories-chart'
import OrderStatisticsChart from './order-statistics-chart'

export default function OverviewReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()
  useEffect(() => {
    if (date) {
      startTransition(async () => {
        setData(await getOrderSummary(date))
      })
    }
  }, [date])

  if (!data)
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='h1-bold'>Welcome, Admin</h1>
          <Skeleton className='h-10 w-[300px]' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className='h-32 w-full' />
          ))}
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className='h-24 w-full' />
          ))}
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          <Skeleton className='col-span-2 h-[400px] w-full' />
          <Skeleton className='h-[400px] w-full' />
        </div>
      </div>
    )

  // Prepare chart data combining sales and purchases for the first chart
  const combinedChartData = data.salesChartData.map((saleItem: any) => {
    const purchaseItem = data.purchaseChartData.find((p: any) => p.date === saleItem.date)
    return {
      date: saleItem.date,
      totalSales: saleItem.totalSales,
      totalPurchases: purchaseItem ? purchaseItem.totalPurchases : 0,
    }
  })

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between mb-2 py-2'>
        <div>
          <h1 className='h1-bold'>Welcome, Admin</h1>
          <p className='text-muted-foreground'>You have {data.ordersCount} Orders, Today</p>
        </div>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>

      {/* Row 1: Main Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <SummaryCard
          title='Total Sales'
          value={formatCurrency(data.totalSales)}
          icon={FileText}
          percentage={22}
          className='bg-orange-50 border-orange-100'
          iconClassName='bg-orange-100 text-orange-600'
        />
        <SummaryCard
          title='Total Sales Return'
          value={formatCurrency(0)}
          icon={RefreshCw}
          percentage={-22}
          className='bg-slate-900 text-white border-slate-800'
          iconClassName='bg-slate-800 text-white'
        />
        <SummaryCard
          title='Total Purchase'
          value={formatCurrency(data.totalPurchases)}
          icon={Gift}
          percentage={22}
          className='bg-emerald-50 border-emerald-100'
          iconClassName='bg-emerald-100 text-emerald-600'
        />
        <SummaryCard
          title='Total Purchase Return'
          value={formatCurrency(0)}
          icon={ShieldCheck}
          percentage={22}
          className='bg-blue-50 border-blue-100'
          iconClassName='bg-blue-100 text-blue-600'
        />
      </div>

      {/* Row 2: Secondary Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold'>{formatCurrency(data.totalSales - data.totalPurchases)}</h3>
              <p className='text-sm text-muted-foreground'>Profit</p>
              <p className='text-xs text-green-600 mt-1'>+35% vs Last Month</p>
            </div>
            <div className='p-2 bg-cyan-50 rounded-lg'>
              <Layers className='h-5 w-5 text-cyan-500' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold'>{formatCurrency(data.invoiceDue)}</h3>
              <p className='text-sm text-muted-foreground'>Invoice Due</p>
              <p className='text-xs text-green-600 mt-1'>+35% vs Last Month</p>
            </div>
            <div className='p-2 bg-teal-50 rounded-lg'>
              <Clock className='h-5 w-5 text-teal-500' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold'>{formatCurrency(data.totalPurchases)}</h3>
              <p className='text-sm text-muted-foreground'>Total Expenses</p>
              <p className='text-xs text-green-600 mt-1'>+41% vs Last Month</p>
            </div>
            <div className='p-2 bg-orange-50 rounded-lg'>
              <Wallet className='h-5 w-5 text-orange-500' />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold'>{formatCurrency(0)}</h3>
              <p className='text-sm text-muted-foreground'>Total Payment Returns</p>
              <p className='text-xs text-red-600 mt-1'>-20% vs Last Month</p>
            </div>
            <div className='p-2 bg-indigo-50 rounded-lg'>
              <Hash className='h-5 w-5 text-indigo-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: New Sections - Top Selling, Low Stock, Recent Sales */}
      <div className='grid gap-4 md:grid-cols-3'>
        <TopSellingProducts data={data.topSalesProducts} />
        <LowStockProducts data={data.lowStockProducts} />
        <RecentSalesList data={data.latestOrders} />
      </div>

      {/* Row 4: Sales Statics & Recent Transactions */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-base'>Sales Statics</CardTitle>
            <div className='flex gap-2'>
              {/* Filter buttons */}
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4 mb-4'>
              <div>
                <p className='text-2xl font-bold text-emerald-500'>{formatCurrency(data.totalSales)}</p>
                <p className='text-xs text-muted-foreground'>Revenue</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-red-500'>{formatCurrency(data.totalPurchases)}</p>
                <p className='text-xs text-muted-foreground'>Expense</p>
              </div>
            </div>
            <SalesStaticsChart data={combinedChartData} />
          </CardContent>
        </Card>
        <RecentTransactionsTable data={data.recentTransactions} />
      </div>

      {/* Row 5: Top Customers, Top Categories, Order Statistics */}
      <div className='grid gap-4 md:grid-cols-3'>
        <TopCustomers data={data.topCustomers} />
        <TopCategoriesChart data={data.topSalesCategories} />
        <OrderStatisticsChart data={data.orderStats} />
      </div>

      {/* Row 6: Original Chart & Overall Info (Keeping these as requested or maybe move them down) */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-base'>Sales & Purchase Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesPurchaseChart data={combinedChartData} />
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Overall Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
                    <Users className='h-5 w-5' />
                  </div>
                  <p className='text-xs text-muted-foreground'>Suppliers</p>
                  <p className='font-bold'>{data.suppliersCount}</p>
                </div>
                <div>
                  <div className='mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600'>
                    <Users className='h-5 w-5' />
                  </div>
                  <p className='text-xs text-muted-foreground'>Customer</p>
                  <p className='font-bold'>{data.usersCount}</p>
                </div>
                <div>
                  <div className='mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600'>
                    <ShoppingCart className='h-5 w-5' />
                  </div>
                  <p className='text-xs text-muted-foreground'>Orders</p>
                  <p className='font-bold'>{data.ordersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
