import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminHeader } from './admin-header'
import { AdminNav } from './admin-nav'
import { APP_NAME } from '@/lib/constants'
import { auth } from '@/auth'
import { Menu as MenuIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import CompanySettingsModal from '@/components/shared/company-settings-modal'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
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
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className='flex items-center shrink-0'>
                            <Link
                                href={`/`}
                                className='flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all active:scale-95 group'
                            >
                                <div className="bg-white p-1 rounded-lg shadow-sm group-hover:shadow-orange-500/20 transition-all">
                                    <Image
                                        src='/images/logo.jpg'
                                        width={28}
                                        height={28}
                                        alt="Store Logo"
                                        className='rounded-sm object-contain'
                                    />
                                </div>
                                <h1 className='text-lg font-black  tracking-tight text-white hidden lg:block group-hover:text-orange transition-colors'>
                                    {APP_NAME}
                                </h1>
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

                <div className='flex pt-[88px] md:pt-16'> {/* Adjust padding for mobile header height */}
                    {/* Desktop Sidebar */}
                    <div className='hidden md:block w-64 fixed left-0 top-16 bottom-0 z-10'>
                        <AdminNav
                            storeId={session?.user?.storeId || ''}
                            storeName={session?.user?.storeName || ''}
                        />
                    </div>

                    {/* Main Content */}
                    <main className='flex-1 w-full md:ml-64 py-4 min-h-[calc(100vh-4rem)] p-5'>
                        {children}
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
