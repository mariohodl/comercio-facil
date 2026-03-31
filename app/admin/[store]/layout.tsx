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
import { OfflineSyncManager } from '@/components/shared/offline-sync-manager'
import { StorePersistenceManager } from '@/components/shared/store-persistence-manager'

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

    const sessionUser = session?.user ? {
        id: session.user.id!,
        companyId: session.user.companyId,
        storeId: session.user.storeId,
        storeName: session.user.storeName,
    } : null;

    return (
        <>
            <OfflineSyncManager storeId={storeId} />
            {sessionUser && <StorePersistenceManager sessionUser={sessionUser} />}
            <div className='flex flex-col min-h-screen bg-gray-50/50'>
                {/* Vibrant & Premium Administrative Header */}
                <header className='fixed top-0 left-0 w-full z-50 transition-all duration-300'>
                    {/* Top Accent Bar: Vibrant Brand Gradient */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-[0_2px_10px_rgba(249,115,22,0.3)]" />
                    
                    {/* Main Header with Lens Flare and Glassmorphism */}
                    <div className='relative bg-[#0F172A]/95 backdrop-blur-3xl border-b border-orange-500/20 overflow-hidden'>
                        {/* Lens Flare / Ambient Color Splashes */}
                        <div className="absolute -top-24 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute top-0 right-0 w-96 h-full bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className='flex h-16 items-center px-5 md:px-10 max-w-[2000px] mx-auto relative z-10'>
                            {/* Mobile Sidebar Trigger: Refined margin */}
                            <div className='nav:hidden mr-2'>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <button className='p-2 bg-white/5 hover:bg-orange-500/10 rounded-xl text-white transition-all active:scale-95 border border-white/10 group shadow-md'>
                                            <MenuIcon className='h-5.5 w-5.5 group-hover:text-orange-400 transition-colors' />
                                        </button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="p-0 w-80 border-r-0 shadow-2xl">
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
    
                            {/* Logo: Refined size and scale */}
                            <div className='flex items-center shrink-0'>
                                <Link
                                    href={`/`}
                                    className='relative py-1 px-3 rounded-2xl hover:bg-white/5 transition-all active:scale-95 group'
                                >
                                    <Image
                                        src='/images/app-logo.png'
                                        alt={APP_NAME}
                                        height={32}
                                        width={166}
                                        priority
                                        className='relative z-10 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.35)] brightness-110'
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                                </Link>
                            </div>
    
                            {/* Breadcrumbs Space */}
                            <AdminHeader className='mx-6 lg:mx-10 flex-1 hidden nav:flex' />
    
                            {/* Actions Right Side */}
                            <div className='ml-auto flex items-center space-x-2 md:space-x-4'>
                                <div className="hidden sm:block h-6 w-[1px] bg-white/10 mx-1" />
                                <Menu forAdmin />
                            </div>
                        </div>
                    </div>
                </header>

                <div className='flex pt-16'>
                    {/* Desktop Sidebar */}
                    <aside className='hidden nav:block w-64 fixed left-0 top-16 bottom-0 z-40'>
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
