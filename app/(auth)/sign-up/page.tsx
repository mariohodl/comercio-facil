import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Image from 'next/image'
import { AppLogo } from '@/components/shared/AppLogo'
import SignUpForm from './signup-form'
import SocialAuth from '@/components/shared/auth/social-auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sign Up',
}

export default async function SignUpPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams

  const { callbackUrl } = searchParams

  const session = await auth()
  if (session) {
    return redirect(callbackUrl || '/')
  }

  return (
    <section className='flex w-full min-h-screen'>
      <article className='w-full lg:w-1/2 px-6 md:px-16 lg:px-28 py-10 lg:py-20 flex flex-col justify-center'>
        <div className=''>
          <div className='flex justify-center mb-6'>
            <AppLogo color="black" />
          </div>
          <div>
            <SignUpForm />
          </div>
          <SeparatorWithOr />
          <div className='mt-4'>
            <SocialAuth />
          </div>

          <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl || '/')}`}>
            <Button className='w-full mt-4' variant='outline'>
              Ya tienes cuenta? Inicia sesión
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
    </section>
  )
}