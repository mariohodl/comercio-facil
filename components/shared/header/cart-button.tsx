'use client'

import { ShoppingCartIcon } from 'lucide-react'
import Link from 'next/link'
import useIsMounted from '@/hooks/use-is-mounted'
import { cn } from '@/lib/utils'
import useCartStore from '@/hooks/use-cart-store'
import useCartSidebar from '@/hooks/use-cart-sidebar'

export default function CartButton() {
  const isMounted = useIsMounted()
  const isCartSidebarOpen = useCartSidebar()

  const {
    cart: { items },
  } = useCartStore()
  const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)
  return (
    <Link href='/cart' className='px-1 header-button relative top-1'>
      <div className='flex items-end text-xs relative'>
        <ShoppingCartIcon className='h-8 w-8' />

        {isMounted && (
          <span
            className={cn(
              `bg-primary  w-5 h-5 rounded-full text-white text-base font-bold absolute right-[30px] top-[-6px] z-10`,
              cartItemsCount >= 10 && 'text-sm '
            )}
          >
            <span className='relative left-[6px] top-[-2px]'>{cartItemsCount}</span>
          </span>
        )}
        <span className='font-bold'>Carrito</span>
        {
        isCartSidebarOpen && (
          <div
            className={`absolute top-[20px] right-[-16px] rotate-[-90deg] z-10 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[8px] border-transparent border-b-background`}
          ></div>
        )
      }
      </div>
    </Link>
  )
}