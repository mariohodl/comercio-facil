import CartButton from './cart-button'
import UserButton from './user-button'
import { LanguageSwitcher } from '../language-switcher'
import data from '@/lib/data'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { AlignRight, ShoppingCart, Globe, LogOut, LayoutDashboard, Settings, User, ChevronRight, Tag, Sparkles, Star, TrendingUp, BadgeDollarSign, Headphones, Info, HelpCircle, Mail } from 'lucide-react'
import { SignOut } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import Image from 'next/image'
import { APP_NAME } from '@/lib/constants'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { X } from 'lucide-react'

// Map menu names to icons for the mobile sidebar
const menuIconMap: { [key: string]: any } = {
  "Today's Deal": Tag,
  "New Arrivals": Sparkles,
  "Featured Products": Star,
  "Best Sellers": TrendingUp,
  "Pricing": BadgeDollarSign,
  "Customer Service": Headphones,
  "About Us": Info,
  "Help": HelpCircle,
  "Contact Us": Mail,
}

const Menu = async ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const session = await auth()
  const t = await getTranslations('header')
  const tCommon = await getTranslations('common')
  const tAdmin = await getTranslations('admin.nav')

  const menuTranslationMap: { [key: string]: string } = {
    "Today's Deal": 'todaysDeal',
    "New Arrivals": 'newArrivals',
    "Featured Products": 'featuredProducts',
    "Best Sellers": 'bestSellers',
    "Pricing": 'pricing',
    "Customer Service": 'customerService',
    "About Us": 'aboutUs',
    "Help": 'help',
    "Contact Us": 'contact',
  }

  return (
    <div className='flex justify-end'>
      <nav className='md:flex gap-3 hidden w-full'>
        <LanguageSwitcher variant={forAdmin ? 'dark' : 'light'} />
        <UserButton variant={forAdmin ? 'dark' : 'light'} />
        {forAdmin ? null : <CartButton />}
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className={`align-middle header-button p-2 ${forAdmin ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-gray-100'} rounded-xl transition-all`}>
            <AlignRight className='h-7 w-7' />
          </SheetTrigger>
          <SheetContent className='bg-gradient-to-b from-orange-50/80 to-white p-0 sm:max-w-md w-full border-l-0 flex flex-col h-full [&>button:last-child]:hidden'>

            {/* Clean Header */}
            <div className="px-6 pt-10 pb-6 shrink-0">
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-20">
                <SheetClose asChild>
                  <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-10 w-10 transition-all">
                    <X className="w-5 h-5" />
                  </Button>
                </SheetClose>
              </div>

              {/* Logo + Welcome */}
              <div className="flex flex-col items-center text-center gap-3">
                <Image
                  src="/images/app-logo.png"
                  alt={APP_NAME}
                  width={160}
                  height={50}
                  className="mb-1"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {session?.user?.name ? `Hola, ${session.user.name.split(' ')[0]}` : tCommon('welcome')}
                  </h2>
                  <p className="text-sm text-gray-400 italic mt-0.5">
                    {session?.user?.name ? tCommon('welcome') : 'Inicia sesión para continuar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 space-y-5">
              {/* Account Section */}
              <div className="space-y-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 divide-y divide-gray-50 overflow-hidden">
                  <Link href="/account" className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-1">{tCommon('myAccount')}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                  {!forAdmin && (
                    <Link href="/cart" className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 flex-1">{tCommon('cart')}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  )}
                  {session?.user?.role === 'Admin' && !forAdmin && (
                    <Link href={`/admin/${session.user.storeId}/overview`} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 flex-1">Admin Panel</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Navigation Links - Same as desktop header */}
              {!forAdmin && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Explorar</h4>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 divide-y divide-gray-50 overflow-hidden">
                    {data.headerMenus.map((menu) => {
                      const IconComponent = menuIconMap[menu.name] || ChevronRight
                      return (
                        <SheetClose asChild key={menu.href}>
                          <Link href={menu.href} className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 flex-1">
                              {t(menuTranslationMap[menu.name] || menu.name)}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Language Section */}
              <div className="space-y-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                  <div className="flex items-center gap-3.5 px-4 py-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-1">{t('language')}</span>
                    <LanguageSwitcher variant="light" />
                  </div>
                </div>
              </div>

              {/* Quick Navigation if Admin */}
              {forAdmin && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/admin/${session?.user?.storeId || ''}/overview`} className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col gap-2.5 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-xs font-semibold text-gray-800">{tAdmin('dashboard')}</span>
                    </Link>
                    <Link href={`/admin/${session?.user?.storeId || ''}/settings`} className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col gap-2.5 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-xs font-semibold text-gray-800">{tAdmin('settings')}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pb-10 shrink-0">
              {session ? (
                <form action={SignOut}>
                  <Button className="w-full bg-white hover:bg-red-50 text-red-500 h-12 rounded-2xl gap-2 border border-gray-200 shadow-sm font-semibold" variant="ghost">
                    <LogOut className="w-4 h-4" />
                    {tCommon('signOut')}
                  </Button>
                </form>
              ) : (
                <Link href="/sign-in">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-2xl font-semibold shadow-sm" variant="default">
                    {tCommon('signIn')}
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

export default Menu