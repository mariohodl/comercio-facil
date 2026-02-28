import { APP_NAME } from '@/lib/constants'
import Container from '@/components/shared/Container'
import Image from 'next/image'
import Link from 'next/link'
import Menu from './menu'
import Logo from './logo'
import data from '@/lib/data'
// import Sidebar from './sidebar'
import Search from './search'
import { getTranslations } from 'next-intl/server'
// import { getAllCategories } from '@/lib/actions/product.actions'

export default async function Header() {
  const t = await getTranslations('header')
  // const categories = await getAllCategories()

  // Map menu keys to translation keys
  const menuTranslationMap: { [key: string]: string } = {
    "Today's Deal": 'todaysDeal',
    "New Arrivals": 'newArrivals',
    "Featured Products": 'featuredProducts',
    "Best Sellers": 'bestSellers',
    "Pricing": 'pricing',
    "Customer Service": 'customerService',
    "About Us": 'aboutUs',
    "Help": 'help',
    "Contact Us": 'contact'
  }

  return (
    <header className='bg-white text-black shadow-sm sticky top-0 z-50 transition-all duration-300'>
      <Container>
        <div className='py-3 px-2'>
          <div className='flex items-center justify-between gap-8'>
            {/* Logo Section */}
            <div className='flex-shrink-0'>
              <Logo />
            </div>

            {/* Search Section */}
            <div className='hidden md:block flex-1 max-w-2xl'>
              {/* <Search /> */}
            </div>

            {/* Menu Section */}
            <div className='flex-shrink-0'>
              <Menu />
            </div>
          </div>

          {/* Mobile Search */}
          <div className='md:hidden block pt-3 pb-2'>
            {/* <Search /> */}
          </div>
        </div>

        {/* Navigation Links */}
        <div className='hidden md:flex items-center gap-6 py-2 px-2 border-t border-gray-100 text-sm font-medium text-gray-600 overflow-x-auto'>
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className='hover:text-primary transition-colors whitespace-nowrap'
            >
              {t(menuTranslationMap[menu.name] || menu.name)}
            </Link>
          ))}
        </div>
      </Container>
    </header>
  )
}