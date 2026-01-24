import CartButton from './cart-button'
import UserButton from './user-button'
import { LanguageSwitcher } from '../language-switcher'
import data from '@/lib/data'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { AlignRight, ShoppingCart, Globe, LogOut, LayoutDashboard, Settings, User } from 'lucide-react'
import { SignOut } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'

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
// import ThemeSwitcher from './theme-switcher'

const Menu = async ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const session = await auth()
  const t = await getTranslations('header')
  const tCommon = await getTranslations('common')
  const tAdmin = await getTranslations('admin.nav')

  // Map menu keys to translation keys
  const menuTranslationMap: { [key: string]: string } = {
    "Today's Deal": 'todaysDeal',
    "New Arrivals": 'newArrivals',
    "Featured Products": 'featuredProducts',
    "Best Sellers": 'bestSellers',
    "Browsing History": 'browsingHistory',
    "Customer Service": 'customerService',
    "About Us": 'aboutUs',
    "Help": 'help'
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
          <SheetTrigger className='align-middle header-button p-2 text-white hover:bg-white/10 rounded-xl transition-all'>
            <AlignRight className='h-7 w-7' />
          </SheetTrigger>
          <SheetContent className='bg-gray-50 p-0 sm:max-w-md w-full border-l-0 flex flex-col h-full [&>button:last-child]:hidden'>
            {/* Mobile Header with Gradient */}
            <div className="bg-navy p-6 pt-12 pb-8 rounded-b-[2rem] shadow-xl relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>

              {/* Custom Close Button - Orange and bigger for better touch range */}
              <div className="absolute top-4 right-4 z-20">
                <SheetClose asChild>
                  <Button size="icon" className="bg-orange hover:bg-orange-dark text-white rounded-full h-12 w-12 shadow-lg shadow-orange-500/40 transition-all active:scale-95 border-2 border-navy">
                    <X className="w-5 h-5" />
                  </Button>
                </SheetClose>
              </div>

              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-orange text-xl font-bold shadow-inner">
                  {session?.user?.name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{tCommon('welcome')}</span>
                  <span className="text-white text-lg font-bold truncate max-w-[180px]">
                    {session?.user?.name || tCommon('signIn')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-8">
              {/* Account Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{tCommon('myAccount')}</h4>
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 space-y-1">
                  <Link href="/account" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-navy flex-1">{tCommon('myAccount')}</span>
                  </Link>
                  {!forAdmin && (
                    <Link href="/cart" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-navy flex-1">{tCommon('cart')}</span>
                    </Link>
                  )}
                  {session?.user?.role === 'Admin' && !forAdmin && (
                    <Link href={`/admin/${session.user.storeId}/overview`} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-navy flex-1">Admin Panel</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{t('language')}</h4>
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-navy">{t('language')}</span>
                  </div>
                  <LanguageSwitcher variant="light" />
                </div>
              </div>

              {/* Quick Navigation if Admin */}
              {forAdmin && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{tAdmin('general')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/admin/${session?.user?.storeId || ''}/overview`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="w-6 h-6 text-orange" />
                      <span className="text-xs font-bold text-navy">{tAdmin('dashboard')}</span>
                    </Link>
                    <Link href={`/admin/${session?.user?.storeId || ''}/settings`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                      <Settings className="w-6 h-6 text-blue-500" />
                      <span className="text-xs font-bold text-navy">{tAdmin('settings')}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Footer */}
            <div className="p-6 pb-10 bg-white border-t border-gray-100 shrink-0">
              {session ? (
                <form action={SignOut}>
                  <Button className="w-full bg-red-50 hover:bg-red-100 text-red-600 h-12 rounded-2xl gap-2 border border-red-100 shadow-none font-bold" variant="ghost">
                    <LogOut className="w-4 h-4" />
                    {tCommon('signOut')}
                  </Button>
                </form>
              ) : (
                <Link href="/sign-in">
                  <Button className="w-full bg-orange hover:bg-orange-dark text-white h-12 rounded-2xl font-bold shadow-lg shadow-orange-500/20" variant="default">
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