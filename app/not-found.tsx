'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Ghost } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden'>
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl" />

      <div className='relative z-10 p-8 md:p-12 rounded-3xl bg-white shadow-2xl shadow-orange-500/10 border border-orange-100 max-w-lg w-[90%] text-center transform transition-all'>
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-orange/10 rounded-2xl animate-bounce duration-1000">
            <Ghost className="w-16 h-16 text-orange" />
          </div>
        </div>

        <h1 className='text-8xl font-black text-navy mb-2 tracking-tighter'>
          {t('title') || '404'}
        </h1>

        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          {t('subTitle') || 'Page Not Found'}
        </h2>

        <p className='text-gray-500 mb-8 leading-relaxed'>
          {t('description') || "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className='h-12 px-8 bg-orange hover:bg-orange-dark text-white rounded-xl shadow-lg shadow-orange-500/20 font-bold transition-all active:scale-95'
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              {t('backHome') || 'Back to Home'}
            </Link>
          </Button>

          <Button
            variant="outline"
            className='h-12 px-8 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-all active:scale-95'
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>

      <p className="absolute bottom-8 text-gray-400 text-sm font-medium">
        © {new Date().getFullYear()} Comercio Fácil. All rights reserved.
      </p>
    </div>
  )
}
