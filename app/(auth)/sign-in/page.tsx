'use client'

import Link from 'next/link'
import { redirect, useSearchParams } from 'next/navigation'
import { AppLogo } from '@/components/shared/AppLogo'
import SocialAuth from '@/components/shared/auth/social-auth'
import SeparatorWithOr from '@/components/shared/separator-or'

import CredentialsSignInForm from './credentials-signin-form'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { ShieldCheck, Users, ArrowLeft } from 'lucide-react'

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'


  return (
    <SignInContent searchParams={searchParams} />
  )
}

function SignInContent({ searchParams }: { searchParams: any }) {
  const [view, setView] = useState<'select' | 'admin'>('select')
  const [lastStore, setLastStore] = useState<{ companyId: string, storeId: string, storeName: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('last_pos_store')
    if (saved) {
      try {
        setLastStore(JSON.parse(saved))
      } catch (e) {
        localStorage.removeItem('last_pos_store')
      }
    }
  }, [])

  if (view === 'select') {
    return (
      <section className='flex w-full min-h-screen bg-gradient-to-br from-orange-50 to-white flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500'>
        <div className='w-full max-w-md mx-auto'>
          <div className='flex justify-center mb-8'>
            <Image
              src="/images/app-logo.png"
              alt={APP_NAME}
              width={220}
              height={70}
              priority
              className="hover:opacity-80 transition-opacity"
            />
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Bienvenido</h1>
          <p className='text-gray-500 mb-10 italic'>Elige cómo quieres ingresar al sistema</p>

          <div className='grid gap-4 w-full'>
            <button
              onClick={() => setView('admin')}
              className='group flex items-center gap-5 p-5 bg-white border-2 border-gray-100 rounded-3xl hover:border-orange hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95'
            >
              <div className='w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange group-hover:bg-orange group-hover:text-white transition-colors duration-300'>
                <ShieldCheck className='w-8 h-8' />
              </div>
              <div className='flex-1 text-left'>
                <h3 className='font-bold text-gray-900 text-lg'>Dueño / Administrador</h3>
                <p className='text-xs text-gray-400'>Gestionar inventario, reportes y empleados</p>
              </div>
            </button>

            {lastStore ? (
              <Link
                href={`/seller-login?companyId=${lastStore.companyId}&storeId=${lastStore.storeId}`}
                className='group flex items-center gap-5 p-5 bg-white border-2 border-orange/30 rounded-3xl hover:border-orange hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95'
              >
                <div className='w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30'>
                  <Users className='w-8 h-8' />
                </div>
                <div className='flex-1 text-left'>
                  <h3 className='font-bold text-gray-900 text-lg'>Personal de Tienda</h3>
                  <p className='text-xs text-orange-600 font-medium'>Entrar a: {lastStore.storeName}</p>
                </div>
              </Link>
            ) : (
              <div className='p-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl opacity-60'>
                <div className='flex items-center gap-5'>
                  <div className='w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400'>
                    <Users className='w-8 h-8' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='font-bold text-gray-400 text-lg'>Personal de Tienda</h3>
                    <p className='text-xs text-gray-400'>Un administrador debe iniciar sesión primero en este dispositivo</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className='mt-12 text-xs text-gray-400 uppercase tracking-widest'>
            {APP_NAME} — Powered by Google Deepmind
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='flex w-full min-h-screen'>
      <article className='w-full lg:w-1/2 px-6 md:px-16 lg:px-28 py-10 lg:py-20 flex flex-col justify-center animate-in slide-in-from-right-8 duration-500'>
        <div className='w-full max-w-md mx-auto'>
          <button
            onClick={() => setView('select')}
            className='flex items-center gap-2 text-gray-400 hover:text-orange transition-colors mb-10'
          >
            <ArrowLeft className='w-4 h-4' />
            <span className='text-sm font-medium'>Regresar</span>
          </button>
          <div className='flex justify-center mb-10'>
            <Link href="/">
              <Image
                src="/images/app-logo.png"
                alt={APP_NAME}
                width={300}
                height={100}
                priority
                className="hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          <div>
            <CredentialsSignInForm />
          </div>
          <SeparatorWithOr />
          <div className='mt-2'>
            <SocialAuth />
          </div>

          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-500'>
              ¿No tienes una cuenta?{' '}
              <Link
                href={`/sign-up?${new URLSearchParams(searchParams as any).toString()}`}
                className='text-orange font-bold hover:underline'
              >
                Regístrate ahora
              </Link>
            </p>
          </div>
        </div>
      </article>


      <div className='hidden lg:block w-1/2 relative'>
        <Image
          src={'/images/register-img.jpg'}
          alt={'register'}
          className='object-cover'
          fill
          priority
        />
      </div>
    </section >
  )
}