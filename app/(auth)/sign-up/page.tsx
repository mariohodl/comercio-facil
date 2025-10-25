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
      <article className='w-1/2 px-28 py-20'> 
        <div className=''>
          <div className='flex justify-center'>
            <AppLogo color="black" />
          </div>
          <div>
            <SignUpForm />
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