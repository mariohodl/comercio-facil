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
import { SheetClose } from '@/components/ui/sheet'
import { usePurchaseFormStore } from '@/hooks/use-purchase-form-store'

export function AdminNav({
  storeId,
  storeName,
  className,
  companyName,
  isMobile,
  userRole
}: {
  storeId: string
  storeName?: string
  className?: string
  companyName?: string
  isMobile?: boolean
  userRole?: string
}) {
  const pathname = usePathname()
  const t = useTranslations('admin.nav')

  const handleItemClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  const baseNavSections = [
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
          href: '/super-admin',
          icon: ShieldCheck,
          role: 'SuperAdmin'
        },
        {
          title: t('settings'),
          href: `/admin/${storeId}/settings`,
          icon: Settings2,
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
        {
          title: t('lowStocks'),
          href: `/admin/${storeId}/stock/low-stocks`,
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
        {
          title: t('printBarcode'),
          href: `/admin/${storeId}/products/print-barcodes`,
          icon: Barcode,
        },
      ],
    },
    {
      title: t('purchases'),
      items: [
        {
          title: t('purchases'),
          href: `/admin/${storeId}/purchases`,
          icon: List,
          excludes: [`/admin/${storeId}/purchases/create`],
        },
        {
          title: t('addPurchase'),
          href: `/admin/${storeId}/purchases/create`,
          icon: PlusSquare,
        },
        // {
        //   title: t('purchaseOrder'),
        //   href: `/admin/${storeId}/purchases/order`,
        //   icon: FileText,
        // },
        // {
        //   title: t('purchaseReturn'),
        //   href: `/admin/${storeId}/purchases/return`,
        //   icon: RotateCcw,
        // },
        {
          title: t('suppliers'),
          href: `/admin/${storeId}/proveedores`,
          icon: Package,
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
          href: `/admin/pos/${storeId}`,
          icon: Monitor,
          hasSubmenu: true,
        },
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
  ]

  // Filter sections based on role
  const navSections = baseNavSections.map(section => ({
    ...section,
    items: section.items.filter((item: any) => !item.role || item.role === userRole)
  })).filter(section => section.items.length > 0)

  // Helper component to wrap links with SheetClose only if on mobile
  const NavLinkWrapper = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    if (isMobile) {
      return <SheetClose asChild={asChild}>{children}</SheetClose>
    }
    return <>{children}</>
  }

  return (
    <nav className={cn(
      'w-full h-full overflow-y-auto bg-white border-r border-gray-200 pb-10',
      className
    )}>
      <div className='p-4 space-y-6 mt-6'>
        <div className='px-2 mb-8'>
          <NavLinkWrapper asChild>
            <Link
              href={`/admin/${storeId}/overview`}
              onClick={handleItemClick}
              className="flex flex-col items-center gap-3 group transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-orange to-orange-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Package className="w-7 h-7" />
              </div>
              <div className="flex flex-col overflow-hidden text-center">
                <h2 className='text-navy font-black text-xl leading-tight truncate tracking-tight group-hover:text-orange transition-colors'>
                  {companyName || 'Comercio Fácil'}
                </h2>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">
                  Admin Panel
                </span>
              </div>
            </Link>
          </NavLinkWrapper>
        </div>
        {navSections.map((section, index) => (
          <div key={index}>
            <h4 className='text-navy font-bold mb-2 px-2 text-sm uppercase tracking-wider'>
              {section.title}
            </h4>
            <div className='space-y-1'>
              {section.items.map((item: any, itemIndex: number) => {
                // @ts-ignore
                const isActive = (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
                  // @ts-ignore
                  (!item.excludes || !item.excludes.some(path => pathname.startsWith(path)))
                const Icon = item.icon

                return (
                  <NavLinkWrapper key={itemIndex} asChild>
                    <Link
                      href={item.href}
                      onClick={() => {
                        handleItemClick();
                        if (item.href.endsWith('/purchases/create')) {
                          usePurchaseFormStore.getState().clearAll();
                        }
                      }}
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
                  </NavLinkWrapper>
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