import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminNav } from './admin-nav'
import { APP_NAME } from '@/lib/constants'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className='flex flex-col'>
        <div className='bg-black text-white'>
          <div className='flex h-16 items-center px-2'>
            <div className='flex items-center'>
              <Link
                href='/'
                className='flex items-center header-button font-extrabold text-2xl m-1 rounded'
              >
                <Image
                  src='/images/logo-prueba3.png'
                  width={60}
                  height={60}
                  alt={`${APP_NAME} logo`}
                  className='rounded-full'
                />
              </Link>
            </div>
            <AdminNav className='mx-6 hidden md:flex' />
            <div className='ml-auto flex items-center space-x-4'>
              <Menu forAdmin />
            </div>
          </div>
          <div>
            <AdminNav className='flex md:hidden px-4 pb-2' />
          </div>
        </div>
        <div className='flex-1 p-4'>{children}</div>
      </div>
    </>
  )
}
