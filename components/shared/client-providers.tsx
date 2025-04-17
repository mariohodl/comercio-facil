'use client'
import React from 'react'
import useCartSidebar from '@/hooks/use-cart-sidebar'
import CartSidebar from './cart-sidebar'
// import { ThemeProvider } from './theme-provider'
// import { Toaster } from '../ui/toast'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartSidebarOpen = useCartSidebar()
      // this code is for the the working uncomment later
//   return <ThemeProvider attribute='class' defaultTheme='system'>
//   {isCartSidebarOpen ? (
//     <div className='flex min-h-screen'>
//       <div className='flex-1 overflow-hidden'>{children}</div>
//       <CartSidebar />
//     </div>
//   ) : (
//     <div>{children}</div>
//   )}
//   {/* <Toaster /> */}
// </ThemeProvider>

return (
<>
{isCartSidebarOpen ? (
    <div className='flex min-h-screen'>
      <div className='flex-1 overflow-hidden'>{children}</div>
      <CartSidebar />
    </div>
  ) : (
    <div>{children}</div>
  )}
  {/* <Toaster /> */}
</>)
  
}