import CartButton from './cart-button'
import UserButton from './user-button'
import { LanguageSwitcher } from '../language-switcher'
import data from '@/lib/data'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

// import { EllipsisVertical } from 'lucide-react'
import { AlignRight } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
// import ThemeSwitcher from './theme-switcher'

const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const t = useTranslations('header')
  const tCommon = useTranslations('common')

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
          <SheetTrigger className='align-middle header-button'>
            <AlignRight className='h-7 w-7' />
          </SheetTrigger>
          <SheetContent className='bg-white text-black flex flex-col gap-6 overflow-y-auto'>
            <SheetHeader className='text-left'>
              <SheetTitle className='text-xl font-bold text-[#1976D2]'>{t('siteMenu')}</SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>

            {/* Mobile Navigation Links */}
            {/* <div className='flex flex-col gap-4 border-b border-gray-100 pb-6'>
              {data.headerMenus.map((menu) => (
                <Link
                  href={menu.href}
                  key={menu.href}
                  className='text-lg font-medium hover:text-[#FF9800] transition-colors'
                >
                  {t(menuTranslationMap[menu.name] || menu.name)}
                </Link>
              ))}
            </div> */}

            <div className='flex flex-col gap-6'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-gray-600'>{t('language')}</span>
                <LanguageSwitcher />
              </div>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-gray-600'>{tCommon('cart')}</span>
                <CartButton />
              </div>
              <div className='pt-2 border-t border-gray-100'>
                <UserButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

export default Menu