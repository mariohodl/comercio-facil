import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AppLogo } from '@/components/shared/AppLogo'
import { auth } from '@/auth'
import SocialAuth from '@/components/shared/auth/social-auth'
import SeparatorWithOr from '@/components/shared/separator-or'

import CredentialsSignInForm from './credentials-signin-form'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
}

export default async function SignIn(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams

  const { callbackUrl = '/' } = searchParams

  const session = await auth()
  if (session) {
    return redirect(callbackUrl)
  }

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
            <CredentialsSignInForm />
          </div>
          <SeparatorWithOr />
          <div className='mt-4'>
            <SocialAuth />
          </div>

          <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button className='w-full mt-4' variant='outline'>
              Crea tu cuenta en {APP_NAME}
            </Button>
          </Link>
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