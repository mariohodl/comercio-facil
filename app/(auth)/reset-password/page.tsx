import { Metadata } from 'next'
import ResetPasswordForm from './reset-password-form'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Restablecer contraseña - Comercio Fácil',
    description: 'Establece una nueva contraseña para tu cuenta.',
}

export default function ResetPasswordPage() {
    return (
        <section className='flex w-full min-h-screen'>
            <article className='w-full lg:w-1/2 px-6 md:px-16 lg:px-28 py-10 lg:py-20 flex flex-col justify-center'>
                <div className='w-full max-w-md mx-auto'>
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
                        <Suspense fallback={
                            <div className='flex items-center justify-center p-8'>
                                <Loader2 className='w-8 h-8 text-orange animate-spin' />
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
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
        </section>
    )
}
