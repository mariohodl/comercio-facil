'use client'
import {
  TrendingUp,
  RotateCcw,
  Gift,
  ShieldCheck,
  Layers,
  Clock,
  Wallet,
  Hash,
  Users,
  ShoppingCart,
  Calculator,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { calculatePastDate, formatCurrency, cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

import { useParams } from 'next/navigation'
import React, { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
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
import OnboardingModal from './onboarding-modal'
import GettingStartedChecklist from './getting-started-checklist'

export default function OverviewReport() {
  const { store } = useParams()
  const t = useTranslations('admin.dashboard')
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>()
  const [isOfflineData, setIsOfflineData] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition()
  const [showChecklist, setShowChecklist] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!store) return;
      const { get, set } = await import('idb-keyval');
      const cacheKey = `dashboard_summary_${store}`;

      try {
        const summary = await getOrderSummary(date as DateRange, store as string);
        setData(summary);
        setIsOfflineData(false);

        // Cache for offline use
        await set(cacheKey, summary);

        // Automatically show checklist if store is empty
        const empty = summary.productsCount === 0 && summary.ordersCount === 0 && summary.purchasesCount === 0;
        if (empty) setShowChecklist(true);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);

        // Try to load from cache
        const cachedData = await get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setIsOfflineData(true);
          // Only show toast if we are actually offline
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            const offlineMsg = t('viewingOfflineData');
            // If next-intl returns the key itself, use a fallback
            toast.warning(offlineMsg.includes('viewingOfflineData') ? 'Viendo datos sin conexión (Caché)' : offlineMsg);
          }
        }
      }
    };

    if (date && store) {
      startTransition(() => {
        fetchData();
      });
    }
  }, [date, store]);

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

  const isEmptyState = data.productsCount === 0 && data.ordersCount === 0 && data.purchasesCount === 0

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
      <OnboardingModal storeId={store as string} />

      <div className={cn(
        'flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2 py-2',
        isEmptyState && 'mb-0 pb-0'
      )}>
        <div className="flex sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className='text-xl md:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap'>{t('welcome')}</h1>
          <div className="flex items-center gap-3">
            {!isEmptyState && !showChecklist && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-left-4 duration-700">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  data.ordersCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                )} />
                <p className='text-[11px] font-bold text-slate-600 uppercase tracking-tight'>
                  {t('ordersToday', { count: data.ordersCount })}
                </p>
              </div>
            )}
            {(isEmptyState || showChecklist) && (
              <button
                onClick={() => setShowChecklist(!showChecklist)}
                className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange hover:text-orange-dark transition-all py-1.5 px-3 rounded-full bg-orange/5 hover:bg-orange/10 border border-orange/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                {showChecklist ? t('showDashboard') : t('showGuide')}
              </button>
            )}
            {isOfflineData && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100/50 text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                <Clock className="w-3 h-3" />
                {t('viewingOfflineData').includes('viewingOfflineData') ? 'Modo Offline' : t('viewingOfflineData')}
              </div>
            )}
          </div>
        </div>
        {/* {!isEmptyState && !showChecklist && (
          <CalendarDateRangePicker defaultDate={date} setDate={setDate} className="w-full md:w-auto" />
        )} */}
      </div>

      {showChecklist ? (
        <GettingStartedChecklist
          storeId={store as string}
          hasProducts={data.productsCount > 0}
          hasPurchases={data.purchasesCount > 0}
          hasSales={data.ordersCount > 0}
        />
      ) : (
        <>
          {/* Row 1: Main Summary Cards */}
          <div className='grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4'>
            <SummaryCard
              title={t('totalSales')}
              value={formatCurrency(data.totalSales)}
              icon={TrendingUp}
              percentage={22}
              className='bg-orange-50 border-orange-100'
              iconClassName='bg-orange-100 text-orange-600'
            />
            <SummaryCard
              title={t('totalUnitsSold')}
              value={t('units', { count: data.totalUnitsSold || 0 })}
              icon={ShoppingCart}
              percentage={12}
              className='bg-navy text-white border-navy-dark'
              iconClassName='bg-navy-dark text-white'
            />
            <SummaryCard
              title={t('totalPurchase')}
              value={formatCurrency(data.totalPurchases)}
              icon={Gift}
              percentage={15}
              className='bg-emerald-50 border-emerald-100'
              iconClassName='bg-emerald-100 text-emerald-600'
            />
            <SummaryCard
              title={t('expense')}
              value={formatCurrency(data.operationalExpenses || 0)}
              icon={Wallet}
              percentage={-5}
              className='bg-rose-50 border-rose-100'
              iconClassName='bg-rose-100 text-rose-600'
            />
          </div>

          {/* Row 2: Secondary Metrics */}
          <div className='grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4'>
            <SummaryCard
              title={t('grossProfit')}
              value={formatCurrency(data.grossProfit)}
              icon={Layers}
              percentage={35}
              className="bg-white border-slate-50"
              iconClassName="bg-cyan-50 text-cyan-600"
            />
            <SummaryCard
              title={t('totalCustomers')}
              value={data.customersCount || 0}
              icon={Users}
              percentage={-10}
              className="bg-white border-slate-50 text-navy"
              iconClassName="bg-teal-50 text-teal-600"
            />
            <SummaryCard
              title={t('totalExpenses')}
              value={formatCurrency(data.totalExpenses)}
              icon={Wallet}
              percentage={41}
              className="bg-white border-slate-50"
              iconClassName="bg-amber-50 text-amber-600"
            />
            <SummaryCard
              title={t('netProfit')}
              value={formatCurrency(data.netProfit)}
              icon={Calculator}
              percentage={8}
              className="bg-navy border-navy text-white shadow-xl shadow-navy/20"
              iconClassName="bg-white/10 text-white"
            />
          </div>

          {/* Row 3: New Sections - Top Selling, Low Stock, Recent Sales */}
          <div className='grid gap-4 md:grid-cols-3'>
            <TopSellingProducts data={data.topSalesProducts} />
            <LowStockProducts data={data.lowStockProducts} storeId={store as string} />
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
        </>
      )}
    </div>
  )
}
