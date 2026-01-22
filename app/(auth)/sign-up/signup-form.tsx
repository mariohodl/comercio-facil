'use client'
import { redirect, useSearchParams } from 'next/navigation'
import { CustomH2 } from '@/components/shared/CustomH2'
import { CustomP } from '@/components/shared/CustomP'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { IUserSignUp } from '@/types'
import { registerUser, signInWithCredentials } from '@/lib/actions/user.actions'
// import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { Separator } from '@/components/ui/separator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { APP_NAME } from '@/lib/constants'
import { toast } from 'sonner'

const signUpDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
      name: 'john doe',
      email: 'john@me.com',
      password: '123456',
      confirmPassword: '123456',
      phone: '1234567890',
    }
    : {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    }

export default function SignUpForm() {
  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })
  const { control, handleSubmit, formState: { errors } } = form
  console.log({ errors })
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'




  const onSubmit = async (data: IUserSignUp) => {
    console.log({ data })
    try {
      const res = await registerUser(data)
      if (!res.success) {
        toast.error(res.error || 'Error al crear la cuenta')
        return
      }

      toast.success(res.message || 'Cuenta creada exitosamente')

      // Redirect to verification page (don't sign in yet)
      const redirectTo = res.redirectUrl || callbackUrl
      redirect(redirectTo)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      toast.error('Ocurrió un error inesperado')
    }
  }

  return (
    <section className=''>
      <div>
        <CustomH2>Regístrate</CustomH2>
        <CustomP>Crea una nueva cuenta de {APP_NAME}.</CustomP>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type='hidden' name='callbackUrl' value={callbackUrl} />
          <div className='space-y-6'>
            <FormField
              control={control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ingresar nombre' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col md:flex-row gap-4 md:gap-5'>
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Ingresar email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder='Ingresar teléfono' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex gap-5'>
              <FormField
                control={control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Contraseña</FormLabel>
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
              <FormField
                control={control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Confirmar Contraseña'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Button type='submit'>Crear Cuenta</Button>
              <div className='text-sm'>
                ¿Ya tienes una cuenta?{' '}
                <Link className='link' href={`/sign-in?callbackUrl=${callbackUrl}`}>
                  <span className='font-bold text-primary underline '>Inicia sesión</span>

                </Link>
              </div>
            </div>
            <div className='text-sm'>
              Al crear una cuenta, estarás aceptando las {' '}
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