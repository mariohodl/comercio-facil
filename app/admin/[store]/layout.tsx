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

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    console.log(session?.user)
    return (
        <>
            <div className='flex flex-col min-h-screen bg-gray-50/50'>
                <div className='bg-[#0f172a] text-white fixed top-0 left-0 w-full z-20 border-b border-white/5 backdrop-blur-xl'>
                    <div className='flex h-16 items-center px-6 transition-all duration-300'>
                        {/* Mobile Sidebar Trigger */}
                        <div className='md:hidden mr-2'>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className='p-2 hover:bg-gray-800 rounded-md'>
                                        <MenuIcon className='h-6 w-6' />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <AdminNav
                                        storeId={session?.user?.storeId || ''}
                                        storeName={session?.user?.storeName || ''}
                                        companyName={session?.user?.companyName || ''}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className='flex items-center shrink-0'>
                            <Link
                                href={`/`}
                                className='px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-95 group'
                            >
                                <Image
                                    src='/images/app-logo.png'
                                    alt={APP_NAME}
                                    height={32}
                                    width={120}
                                    priority
                                    className='object-contain brightness-0 invert'
                                />
                            </Link>
                        </div>
                        <AdminHeader className='mx-6 flex-1 hidden md:flex' />
                        <div className='ml-auto flex items-center space-x-4'>
                            <Menu forAdmin />
                        </div>
                    </div>
                    {/* Mobile Header Links */}
                    <div className='md:hidden border-t border-gray-800'>
                        <AdminHeader className='flex px-4 py-2 overflow-x-auto' />
                    </div>
                </div>

                <div className='flex pt-28 md:pt-16'> {/* Adjusted padding for mobile double header */}
                    {/* Desktop Sidebar */}
                    <aside className='hidden md:block w-64 fixed left-0 top-16 bottom-0 z-10'>
                        <AdminNav
                            storeId={session?.user?.storeId || ''}
                            storeName={session?.user?.storeName || ''}
                            companyName={session?.user?.companyName || ''}

                        />
                    </aside>

                    {/* Main Content */}
                    <main className='flex-1 w-full md:ml-64 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 overflow-hidden'>
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
