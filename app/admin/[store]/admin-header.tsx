'use client'
import React from 'react'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search, Bell, Plus, ChevronRight, Home } from 'lucide-react'
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

  return (
    <div
      className={cn(
        'flex items-center justify-between w-full gap-4',
        className
      )}
      {...props}
    >
      {/* Left side: Breadcrumbs */}
      <div className="flex items-center gap-3 text-sm">
        <div className="h-6 w-[1px] bg-white/10 mx-2 hidden lg:block" /> {/* Separator from logo section */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-gray-400"
        >
          <Home className="w-4 h-4" />
        </div>
        <ChevronRight className="w-3 h-3 text-gray-600" />
        <div className="flex items-center bg-white/5 rounded-full px-1 py-1 border border-white/5">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <span
                className={cn(
                  "px-3 py-1 rounded-full whitespace-nowrap transition-all",
                  crumb.active
                    ? "bg-orange text-white font-semibold shadow-lg shadow-orange-500/20"
                    : "text-gray-400"
                )}
              >
                {crumb.label}
              </span>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3 h-3 mx-1 text-gray-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>



      {/* Right side: Quick Actions & Notifications */}
      <div className="flex items-center gap-2">
        {/* Search icon for mobile/tablet */}
        <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800">
          <Search className="w-5 h-5" />
        </Button>

        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-orange hover:bg-orange-dark text-white h-9 px-4 gap-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-500/20">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">{t('quickAction') || 'Quick Action'}</span>
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

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-transform active:scale-90">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}