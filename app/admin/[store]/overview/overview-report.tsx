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
import { calculatePastDate, formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'

import React, { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { getOrderSummary } from '@/lib/actions/order.actions'
import { CalendarDateRangePicker } from './date-range-picker'
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
  const t = useTranslations('admin.dashboard')
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition()
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
          <h1 className='h1-bold'>{t('welcome')}</h1>
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
  const combinedChartData = data.salesChartData.map((saleItem: { date: string; totalSales: number }) => {
    const purchaseItem = data.purchaseChartData.find((p: { date: string; totalPurchases: number }) => p.date === saleItem.date)
    return {
      date: saleItem.date,
      totalSales: saleItem.totalSales,
      totalPurchases: purchaseItem ? purchaseItem.totalPurchases : 0,
    }
  })

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2 py-2'>
        <div>
          <h1 className='h1-bold'>{t('welcome')}</h1>
          <p className='text-muted-foreground'>{t('ordersToday', { count: data.ordersCount })}</p>
        </div>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} className="w-full md:w-auto" />
      </div>

      {/* Row 1: Main Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <SummaryCard
          title={t('totalSales')}
          value={formatCurrency(data.totalSales)}
          icon={FileText}
          percentage={22}
          className='bg-orange-50 border-orange-100'
          iconClassName='bg-orange-100 text-orange-600'
        />
        <SummaryCard
          title={t('totalSalesReturn')}
          value={formatCurrency(0)}
          icon={RefreshCw}
          percentage={-22}
          className='bg-navy text-white border-navy-dark'
          iconClassName='bg-navy-dark text-white'
        />
        <SummaryCard
          title={t('totalPurchase')}
          value={formatCurrency(data.totalPurchases)}
          icon={Gift}
          percentage={22}
          className='bg-emerald-50 border-emerald-100'
          iconClassName='bg-emerald-100 text-emerald-600'
        />
        <SummaryCard
          title={t('totalPurchaseReturn')}
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
              <p className='text-sm text-muted-foreground'>{t('profit')}</p>
              <p className='text-xs text-green-600 mt-1'>+35% {t('vsLastMonth')}</p>
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
              <p className='text-sm text-muted-foreground'>{t('invoiceDue')}</p>
              <p className='text-xs text-green-600 mt-1'>+35% {t('vsLastMonth')}</p>
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
              <p className='text-sm text-muted-foreground'>{t('totalExpenses')}</p>
              <p className='text-xs text-green-600 mt-1'>+41% {t('vsLastMonth')}</p>
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
              <p className='text-sm text-muted-foreground'>{t('totalPaymentReturns')}</p>
              <p className='text-xs text-red-600 mt-1'>-20% {t('vsLastMonth')}</p>
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
            <CardTitle className='text-base'>{t('salesStatics')}</CardTitle>
            <div className='flex gap-2'>
              {/* Filter buttons */}
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4 mb-4'>
              <div>
                <p className='text-2xl font-bold text-emerald-500'>{formatCurrency(data.totalSales)}</p>
                <p className='text-xs text-muted-foreground'>{t('revenue')}</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-red-500'>{formatCurrency(data.totalPurchases)}</p>
                <p className='text-xs text-muted-foreground'>{t('expense')}</p>
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
            <CardTitle className='text-base'>{t('salesPurchaseOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesPurchaseChart data={combinedChartData} />
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('overallInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
                    <Users className='h-5 w-5' />
                  </div>
                  <p className='text-xs text-muted-foreground'>{t('suppliers')}</p>
                  <p className='font-bold'>{data.suppliersCount}</p>
                </div>
                <div>
                  <div className='mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600'>
                    <Users className='h-5 w-5' />
                  </div>
                  <p className='text-xs text-muted-foreground'>{t('customer')}</p>
                  <p className='font-bold'>{data.usersCount}</p>
                </div>
                <div>
                  <div className='mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600'>
                    <ShoppingCart className='h-5 w-5' />
                  </div>
                  <p className='text-xs text-muted-foreground'>{t('orders')}</p>
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
