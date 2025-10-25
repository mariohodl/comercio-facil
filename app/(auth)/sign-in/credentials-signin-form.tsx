'use client'
import { redirect, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomH2 } from '@/components/shared/CustomH2'
import { CustomP } from '@/components/shared/CustomP'
import Link from 'next/link'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignIn } from '@/types'
import { signInWithCredentials } from '@/lib/actions/user.actions'

// import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignInSchema } from '@/lib/validator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { APP_NAME } from '@/lib/constants'

const signInDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        email: 'mario@example.com',
        password: '123456',
      }
    : {
        email: '',
        password: '',
      }

export default function CredentialsSignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignIn) => {
    try {
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
    //   toast({
    //     title: 'Error',
    //     description: 'Invalid email or password',
    //     variant: 'destructive',
    //   })
    }
  }

  return (
    <section className=''>
      <div>
        <CustomH2>Ingresar</CustomH2>
        <CustomP>Accede a tu cuenta de {APP_NAME} usando tu correo y contraseña.</CustomP>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type='hidden' name='callbackUrl' value={callbackUrl} />
          <div className='space-y-6'>
            <FormField
              control={control}
              name='email'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Correo<span className='text-red-800'>*</span></FormLabel>
                  <FormControl>
                    <Input placeholder='Ingresar correo' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            <FormField
              control={control}
              name='password'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Contraseña<span className='text-red-800'>*</span></FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Ingresar contraseña'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type='submit'>Entrar</Button>
            </div>
            <div className='text-sm'>
              Al ingresar, estás aceptando las {' '}
              <Link href='/page/conditions-of-use'>Condiciones de Uso</Link> y{' '}
              <Link href='/page/privacy-policy'>Aviso de Privacidad.</Link> de{' '}
              {APP_NAME}
            </div>
          </div>
        </form>
      </Form>
    </section>
    
  )
}