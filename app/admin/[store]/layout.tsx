import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminHeader } from './admin-header'
import { AdminNav } from './admin-nav'
import { APP_NAME } from '@/lib/constants'
import { auth } from '@/auth'
import { Menu as MenuIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import CompanySettingsModal from '@/components/shared/company-settings-modal'
import { AppLogo } from '@/components/shared/AppLogo'
import { hasProducts } from '@/lib/actions/product.actions'
import { hasPurchases } from '@/lib/actions/purchase.actions'
import { hasSales } from '@/lib/actions/order.actions'

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ store: string }>
}) {
    const session = await auth()
    const { store: storeId } = await params

    // Fetch onboarding status
    const [hasProductsStatus, hasPurchasesStatus, hasSalesStatus] = await Promise.all([
        storeId ? hasProducts(storeId) : Promise.resolve(false),
        storeId ? hasPurchases(storeId) : Promise.resolve(false),
        storeId ? hasSales(storeId) : Promise.resolve(false)
    ])

    return (
        <>
            <div className='flex flex-col min-h-screen bg-gray-50/50'>
                <div className='bg-black text-white fixed top-0 left-0 w-full z-20 border-b border-white/5 backdrop-blur-xl'>
                    <div className='flex h-16 items-center md:px-6 transition-all duration-300'>
                        {/* Mobile Sidebar Trigger */}
                        <div className='nav:hidden mr-2'>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className='p-2 hover:bg-gray-800 rounded-md'>
                                        <MenuIcon className='h-6 w-6' />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <AdminNav
                                        storeId={storeId}
                                        storeName={session?.user?.storeName || ''}
                                        companyName={session?.user?.companyName || ''}
                                        isMobile={true}
                                        userRole={session?.user?.role}
                                        hasProducts={hasProductsStatus}
                                        hasPurchases={hasPurchasesStatus}
                                        hasSales={hasSalesStatus}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className='flex items-center shrink-0'>
                            <Link
                                href={`/`}
                                className=' py-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-95 group'
                            >
                                <Image
                                    src='/images/app-logo.png'
                                    alt={APP_NAME}
                                    height={32}
                                    width={166}
                                    priority
                                    className='object-contain'
                                />
                            </Link>
                        </div>
                        <AdminHeader className='mx-6 flex-1 hidden nav:flex' />
                        <div className='ml-auto flex items-center space-x-4'>
                            <Menu forAdmin />
                        </div>
                    </div>
                </div>

                <div className='flex pt-16'>
                    {/* Desktop Sidebar */}
                    <aside className='hidden nav:block w-64 fixed left-0 top-16 bottom-0 z-10'>
                        <AdminNav
                            storeId={storeId}
                            storeName={session?.user?.storeName || ''}
                            companyName={session?.user?.companyName || ''}
                            userRole={session?.user?.role}
                            hasProducts={hasProductsStatus}
                            hasPurchases={hasPurchasesStatus}
                            hasSales={hasSalesStatus}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className='flex-1 w-full nav:ml-64 min-h-[calc(100vh-4rem)] p-2 overflow-hidden'>
                        <div className="w-full space-y-6">
                            {children}
                        </div>
                    </main>
                </div>
                <CompanySettingsModal
                    isOpen={!session?.user?.storeName || !session?.user?.storeId}
                    userId={session?.user?.id || ''}
                />
            </div>
        </>
    )
}
