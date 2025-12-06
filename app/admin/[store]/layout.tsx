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
            <div className='flex flex-col min-h-screen'>
                <div className='bg-black text-white fixed top-0 left-0 w-full z-20'>
                    <div className='flex h-16 items-center px-4'>
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
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className='flex items-center'>
                            <Link
                                href='/'
                                className='flex items-center header-button font-extrabold text-2xl m-1 rounded'
                            >
                                <Image
                                    src='/images/logo-prueba3.png'
                                    width={40}
                                    height={40}
                                    alt={`${APP_NAME} logo`}
                                    className='rounded-full'
                                />
                            </Link>
                        </div>
                        <AdminHeader className='mx-6 hidden md:flex' />
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
                        <AdminNav storeId={session?.user?.storeId || ''} />
                    </div>

                    {/* Main Content */}
                    <main className='flex-1 w-full md:ml-64 py-4 min-h-[calc(100vh-4rem)]'>
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
