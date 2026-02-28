'use client'
import React from 'react'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search, Bell, Plus, ChevronRight, Home, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function AdminHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { store } = useParams<{ store: string }>()
  const t = useTranslations('admin.header')
  const tCommon = useTranslations('common')

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href,
      active: pathname === href
    }
  }).filter(b => b.href !== `/admin/${store}`) // Skip the store root if redundant

  const { data: session } = useSession()
  const isSeller = session?.user?.role === 'Seller'

  return (
    <div
      className={cn(
        'flex items-center justify-end md:justify-between w-full h-10',
        className
      )}
      {...props}
    >
      {/* Left side: Breadcrumbs */}
      <div className="hidden md:flex items-center gap-2 overflow-hidden">
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-gray-400">
            <Home className="w-4 h-4" />
          </div>
          <ChevronRight className="w-3 h-3 text-gray-700" />
        </div>
      </div>



      <div className="flex items-center gap-2 ml-auto">
        {/* POS Access Button */}
        <Button variant="outline" size="sm" asChild className="hidden sm:flex h-9 border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white gap-2 rounded-lg transition-all active:scale-95 px-4 group border border-dashed">
          <Link href={`/admin/pos/${store}`}>
            <ShoppingCart className="w-4 h-4 text-orange group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-tight">{tCommon('goToPOS') || 'Vender'}</span>
          </Link>
        </Button>

        {/* Search icon for mobile/tablet */}
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg shrink-0">
          <Search className="w-5 h-5" />
        </Button>

        {/* Quick Actions Dropdown */}
        {!isSeller && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-orange hover:bg-orange-dark text-white h-9 px-3 sm:px-4 gap-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-500/20 shrink-0">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-tight">
                  <span className="inline sm:hidden">{t('quickAction')}</span>
                  <span className="hidden sm:inline">{t('quickAction') || 'Acción Rápida'}</span>
                </span>
                <Plus className="hidden sm:block w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
              <DropdownMenuLabel className="text-navy font-bold">{t('shortcuts') || 'Shortcuts'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/${store}/products/create`} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>{t('newProduct') || 'New Product'}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/${store}/pos`} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>{t('newSale') || 'New Sale'}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

        {/* Notifications */}
        {/* <div className="relative shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-transform active:scale-90">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>
        </div> */}
      </div>
    </div>
  )
}