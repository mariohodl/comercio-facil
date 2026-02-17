'use client'
import { redirect, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { User, Mail, Phone, Lock, CheckCircle2, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
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
      promoCode: '',
    }
    : {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      promoCode: '',
    }

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })
  const { control, handleSubmit, formState: { errors }, setValue } = form
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const promoCode = searchParams.get('promo')

  useEffect(() => {
    if (promoCode) {
      setValue('promoCode', promoCode)
    }
  }, [promoCode, setValue])




  const onSubmit = async (data: IUserSignUp) => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='mb-8 text-left'>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-2'>Únete a nosotros</h1>
        <p className='text-muted-foreground italic'>
          Crea tu cuenta en <span className='font-semibold text-orange'>{APP_NAME}</span> y empieza a escalar tu negocio.
        </p>

        {promoCode === 'EXITO2026' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm font-medium animate-bounce-subtle shadow-sm">
            <div className='bg-green-100 p-1.5 rounded-full'>
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <span>¡Código <strong>EXITO2026</strong> aplicado! 3 meses extra gratis.</span>
          </div>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type='hidden' name='callbackUrl' value={callbackUrl} />
          <input type='hidden' {...form.register('promoCode')} />
          <div className='space-y-4'>
            <FormField
              control={control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Nombre Completo</FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                        <User className='w-4 h-4' />
                      </div>
                      <Input
                        placeholder='Juan Pérez'
                        {...field}
                        className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Email</FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                          <Mail className='w-4 h-4' />
                        </div>
                        <Input
                          placeholder='juan@ejemplo.com'
                          {...field}
                          className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Teléfono</FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                          <Phone className='w-4 h-4' />
                        </div>
                        <Input
                          placeholder='55 1234 5678'
                          {...field}
                          className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Contraseña</FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                          <Lock className='w-4 h-4' />
                        </div>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          {...field}
                          className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Confirmar</FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                          <ShieldCheck className='w-4 h-4' />
                        </div>
                        <Input
                          type='password'
                          placeholder='••••••••'
                          {...field}
                          className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='pt-4'>
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full h-11 bg-orange hover:bg-orange-600 text-white font-bold text-base transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg'
              >
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <span>Crear mi cuenta</span>
                    <ArrowRight className='w-4 h-4' />
                  </div>
                )}
              </Button>

              <div className='mt-6 text-center text-sm text-gray-600'>
                ¿Ya tienes una cuenta?{' '}
                <Link className='font-bold text-orange hover:underline transition-all' href={`/sign-in?callbackUrl=${callbackUrl}`}>
                  Inicia sesión aquí
                </Link>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  )
}