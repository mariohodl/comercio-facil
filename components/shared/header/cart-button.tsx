'use client'

import { ShoppingCartIcon } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import useIsMounted from '@/hooks/use-is-mounted'
import { cn } from '@/lib/utils'
import useCartStore from '@/hooks/use-cart-store'
import useCartSidebar from '@/hooks/use-cart-sidebar'

export default function CartButton() {
  const t = useTranslations('common')
  const isMounted = useIsMounted()
  const isCartSidebarOpen = useCartSidebar()

  const {
    cart: { items },
  } = useCartStore()
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)
  return (
    <Link href='/cart' className='relative group flex items-center gap-2 p-2 hover:bg-gray-50 rounded-full transition-colors'>
      <div className='relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors'>
        <ShoppingCartIcon className='h-5 w-5 text-gray-700' />

        {isMounted && cartItemsCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-[#FF9800] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white'>
            {cartItemsCount > 9 ? '9+' : cartItemsCount}
          </span>
        )}
      </div>
      <span className="font-semibold text-sm hidden md:block">{t('cart')}</span>
    </Link>
  )
}