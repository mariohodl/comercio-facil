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
  title: 'Iniciar sesión',
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
      <article className='w-1/2 px-28 py-20'> 
        <div className=''>
          <div className='flex justify-center'>
            <AppLogo color="black" />
          </div>
          <div>
            <CredentialsSignInForm />
          </div>
          <SeparatorWithOr />
          <div className='mt-4'>
            <SocialAuth />
          </div>

          <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button className='w-full' variant='outline'>
              Crea tu cuenta en {APP_NAME}
            </Button>
          </Link>
        </div>
      </article>
      
      <div className='w-1/2'>
        <div className=' w-full h-full relative'>
          <Image
            src={'/images/register-img.jpg'}
            alt={'register'}
            className='h-auto'
            fill
          />
        </div>
      </div>
    </section>
  )
}