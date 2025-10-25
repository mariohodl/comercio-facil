'use client'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
// import { SignInWithFacebook } from '@/lib/actions/user.actions'

export function FacebookSignInForm() {
  const SignInButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button disabled={pending} className='w-full' variant='outline'>
        {pending ? 'Redireccionando a Facebook...' : 'Iniciar sesión con Facebook'}
      </Button>
    )
  }
  return (
    <form action={()=>{}}>
      <SignInButton />
    </form>
  )
}