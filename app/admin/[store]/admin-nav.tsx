'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'
import { cn } from '@/lib/utils'
import {
  Box,
  PlusSquare,
  AlertCircle,
  TrendingDown,
  List,
  Layers,
  Tag,
  Ruler,
  Settings2,
  ShieldCheck,
  Barcode,
  Package,
  ArrowLeftRight,
  ArrowUpRight,
  ShoppingCart,
  FileText,
  RotateCcw,
  FileOutput,
  Monitor,
  ChevronRight
} from 'lucide-react'
import Logo from '@/components/shared/header/logo'

export function AdminNav({
  storeId,
  storeName,
  className,
}: {
  storeId: string
  storeName?: string
  className?: string
}) {
  const pathname = usePathname()
  const t = useTranslations('admin.nav')

  const navSections = [
    {
      title: t('general'),
      items: [
        {
          title: t('overview'),
          href: `/admin/${storeId}/overview`,
          icon: Monitor,
        },
        {
          title: t('superAdmin'),
          href: `/admin/${storeId}/superadmin`,
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: t('inventory'),
      items: [
        {
          title: t('products'),
          href: `/admin/${storeId}/products`,
          icon: Box,
          excludes: [`/admin/${storeId}/products/create`],
        },
        {
          title: t('createProduct'),
          href: `/admin/${storeId}/products/create`,
          icon: PlusSquare,
        },
        // {
        //   title: t('expiredProducts'),
        //   href: `/admin/${storeId}/inventory/expired-products`,
        //   icon: AlertCircle,
        // },
        {
          title: t('lowStocks'),
          href: `/admin/${storeId}/inventory/low-stocks`,
          icon: TrendingDown,
        },
        {
          title: t('category'),
          href: `/admin/${storeId}/inventory/categories`,
          icon: List,
        },
        {
          title: t('subCategory'),
          href: `/admin/${storeId}/inventory/sub-categories`,
          icon: Layers,
        },
        {
          title: t('brands'),
          href: `/admin/${storeId}/inventory/brands`,
          icon: Tag,
        },
        {
          title: t('units'),
          href: `/admin/${storeId}/inventory/units`,
          icon: Ruler,
        },
        {
          title: t('variantAttributes'),
          href: `/admin/${storeId}/inventory/attributes`,
          icon: Settings2,
        },
        // {
        //   title: t('warranties'),
        //   href: `/admin/${storeId}/inventory/warranties`,
        //   icon: ShieldCheck,
        // },
        {
          title: t('printBarcode'),
          href: `/admin/${storeId}/products/print-barcodes`,
          icon: Barcode,
        },
        // {
        //   title: t('printQRCode'),
        //   href: `/admin/${storeId}/inventory/print-qrcode`,
        //   icon: QrCode,
        // },
      ],
    },
    {
      title: t('stock'),
      items: [
        {
          title: t('manageStock'),
          href: `/admin/${storeId}/stock/manage`,
          icon: Package,
        },
        {
          title: t('stockAdjustment'),
          href: `/admin/${storeId}/stock/adjustment`,
          icon: ArrowUpRight,
        },
        {
          title: t('stockTransfer'),
          href: `/admin/${storeId}/stock/transfer`,
          icon: ArrowLeftRight,
        },
      ],
    },
    {
      title: t('sales'),
      items: [
        {
          title: t('sales'),
          href: `/admin/${storeId}/sales`,
          icon: ShoppingCart,
          hasSubmenu: true,
        },
        {
          title: t('invoices'),
          href: `/admin/${storeId}/sales/invoices`,
          icon: FileText,
        },
        {
          title: t('salesReturn'),
          href: `/admin/${storeId}/sales/returns`,
          icon: RotateCcw,
        },
        {
          title: t('quotation'),
          href: `/admin/${storeId}/sales/quotations`,
          icon: FileOutput,
        },
        {
          title: t('pos'),
          href: `/admin/${storeId}/pos`,
          icon: Monitor,
          hasSubmenu: true,
        },
      ],
    },
    {
      title: t('userManagement'),
      items: [
        {
          title: t('users'),
          href: `/admin/${storeId}/users`,
          icon: ShieldCheck,
        },
      ],
    },
  ]

  return (
    <nav className={cn(
      'fixed w-64 h-[calc(100vh-3rem)] left-0 top-12 shadow-md overflow-y-auto bg-white border-r border-gray-200 pb-10',
      className
    )}>
      <div className='p-4 space-y-6 mt-6'>
        <div className='px-2 mb-8'>
          <Link href={`/admin/${storeId}/overview`} className="flex flex-col items-center gap-3 group transition-all duration-300">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-orange to-orange-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-7 h-7" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h2 className='text-navy font-black text-xl leading-tight truncate tracking-tight group-hover:text-orange transition-colors'>
                {storeName || 'Comercio Fácil'}
              </h2>
              <span className="text-[10px] uppercase text-center font-bold text-gray-400 tracking-widest leading-none">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>
        {navSections.map((section, index) => (
          <div key={index}>
            <h4 className='text-navy font-bold mb-2 px-2 text-sm uppercase tracking-wider'>
              {section.title}
            </h4>
            <div className='space-y-1'>
              {section.items.map((item, itemIndex) => {
                // @ts-ignore
                const isActive = (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
                  // @ts-ignore
                  (!item.excludes || !item.excludes.some(path => pathname.startsWith(path)))
                const Icon = item.icon

                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-orange-50 text-orange border-r-4 border-orange'
                        : 'text-navy hover:bg-gray-100'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <Icon className={cn('w-5 h-5', isActive ? 'text-orange' : 'text-gray-500')} />
                      <span>{item.title}</span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight className='w-4 h-4 text-gray-400' />
                    )}
                  </Link>
                )
              })}
            </div>
            {index < navSections.length - 1 && (
              <div className='my-4 border-b border-gray-100' />
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}