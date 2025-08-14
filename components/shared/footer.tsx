'use client'

import { ArrowUp } from 'lucide-react'
// import { Button } from '../ui/button'
// import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import { CustomH3 } from './CustomH3'
import { CustomP } from './CustomP'

export default function Footer() {

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return (
    <footer className='bg-[#fef8ef]  text-black underline-link'>
      <div className='rounded-full fixed bottom-10 right-4'>
        <p
          className='bg-gray-800 cursor-pointer rounded-full w-12 h-12 '
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className='h-8 w-8 text-white ml-2 pt-3' />
        </p>
      </div>
      <div className='p-3'>
        <div className='flex justify-between text-sm p-16 mx-10'>
          <div>
            <CustomH3 classNames="!text-[38px] font-semibold mb-7">Master Karne</CustomH3>
            <CustomP classNames="!text-black !text-[20px] font-extralight ml-1">Lleva tu negocio a nuevas alturas.</CustomP>
          </div>

          <div>
            <CustomH3 classNames="!text-[38px] font-semibold mb-7">ventas@masterkarne.com</CustomH3>
            <CustomP classNames="!text-black !text-[20px] font-extralight ml-1">Lunes - Viernes 9:00am - 6:00pm</CustomP>
          </div>

          <div>
            <CustomH3 classNames="!text-[38px] font-semibold mb-7">(234) 567.890.11</CustomH3>
            <CustomP classNames="!text-black !text-[20px] font-extralight ml-1">Whatsapp o Llamadas</CustomP>
          </div>
        </div>
        <div className='pt-3 flex justify-center text-sm text-gray-500 border-t border-dashed'>
          <p>Copyright © {currentYear}, {APP_NAME}, Inc.</p>
          {/* 123, Main Street, Anytown, CA, Zip 12345 | +1 (123) 456-7890 */}
        </div>
      </div>
    </footer>
  )
}