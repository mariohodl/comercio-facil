'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  QrCode,
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

export function AdminNav({
  storeId,
  className,
}: {
  storeId: string
  className?: string
}) {
  const pathname = usePathname()

  const navSections = [
    {
      title: 'General',
      items: [
        {
          title: 'Overview',
          href: `/admin/${storeId}/overview`,
          icon: Monitor,
        },
        {
          title: 'Super Admin',
          href: `/admin/${storeId}/superadmin`,
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: 'Inventory',
      items: [
        {
          title: 'Products',
          href: `/admin/${storeId}/products`,
          icon: Box,
        },
        {
          title: 'Create Product',
          href: `/admin/${storeId}/products/create`,
          icon: PlusSquare,
        },
        {
          title: 'Expired Products',
          href: `/admin/${storeId}/inventory/expired-products`,
          icon: AlertCircle,
        },
        {
          title: 'Low Stocks',
          href: `/admin/${storeId}/inventory/low-stocks`,
          icon: TrendingDown,
        },
        {
          title: 'Category',
          href: `/admin/${storeId}/inventory/categories`,
          icon: List,
        },
        {
          title: 'Sub Category',
          href: `/admin/${storeId}/inventory/sub-categories`,
          icon: Layers,
        },
        {
          title: 'Brands',
          href: `/admin/${storeId}/inventory/brands`,
          icon: Tag,
        },
        {
          title: 'Units',
          href: `/admin/${storeId}/inventory/units`,
          icon: Ruler,
        },
        {
          title: 'Variant Attributes',
          href: `/admin/${storeId}/inventory/attributes`,
          icon: Settings2,
        },
        {
          title: 'Warranties',
          href: `/admin/${storeId}/inventory/warranties`,
          icon: ShieldCheck,
        },
        {
          title: 'Print Barcode',
          href: `/admin/${storeId}/inventory/print-barcode`,
          icon: Barcode,
        },
        {
          title: 'Print QR Code',
          href: `/admin/${storeId}/inventory/print-qrcode`,
          icon: QrCode,
        },
      ],
    },
    {
      title: 'Stock',
      items: [
        {
          title: 'Manage Stock',
          href: `/admin/${storeId}/stock/manage`,
          icon: Package,
        },
        {
          title: 'Stock Adjustment',
          href: `/admin/${storeId}/stock/adjustment`,
          icon: ArrowUpRight,
        },
        {
          title: 'Stock Transfer',
          href: `/admin/${storeId}/stock/transfer`,
          icon: ArrowLeftRight,
        },
      ],
    },
    {
      title: 'Sales',
      items: [
        {
          title: 'Sales',
          href: `/admin/${storeId}/sales`,
          icon: ShoppingCart,
          hasSubmenu: true,
        },
        {
          title: 'Invoices',
          href: `/admin/${storeId}/sales/invoices`,
          icon: FileText,
        },
        {
          title: 'Sales Return',
          href: `/admin/${storeId}/sales/returns`,
          icon: RotateCcw,
        },
        {
          title: 'Quotation',
          href: `/admin/${storeId}/sales/quotations`,
          icon: FileOutput,
        },
        {
          title: 'POS',
          href: `/admin/${storeId}/pos`,
          icon: Monitor,
          hasSubmenu: true,
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
        {navSections.map((section, index) => (
          <div key={index}>
            <h4 className='text-navy font-bold mb-2 px-2 text-sm uppercase tracking-wider'>
              {section.title}
            </h4>
            <div className='space-y-1'>
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
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