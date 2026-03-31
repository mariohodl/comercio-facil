'use client'
import { redirect, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2, KeyRound, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
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
import { signInWithCredentials, getSession } from '@/lib/actions/user.actions'

// import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignInSchema } from '@/lib/validator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { APP_NAME } from '@/lib/constants'
import { toast } from 'sonner'

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
  const promo = searchParams.get('promo')

  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignIn) => {
    setIsLoading(true)
    try {
      const result = await signInWithCredentials({
        email: data.email,
        password: data.password,
      })

      console.log('DEBUG: result from signIn:', result)
      if (result?.error) {
        if (result.error === 'OAuthAccount' || result.error.includes('OAuthAccount')) {
          toast.error('Acceso restringido: Cuenta de Google', {
            description: 'Este correo está registrado vía Google. Haz clic en "Olvidaste tu contraseña" para crear una clave y poder entrar por aquí.',
            duration: 8000,
          })
        } else {
          toast.error('Credenciales inválidas')
        }
        return
      }

      const session = await getSession()

      if (session?.user) {
        const { role, storeId, companyId, storeName } = session.user

        // Save store info for PIN login selection in this device
        if (storeId && companyId && storeName) {
          localStorage.setItem('last_pos_store', JSON.stringify({
            companyId,
            storeId,
            storeName
          }))
        }

        if (role === 'Seller' && storeId) {
          redirect(`/admin/pos/${storeId}`)
        } else if (role === 'Admin' && storeId) {
          redirect(`/admin/${storeId}/overview`)
        }
      }

      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='mb-8 text-left'>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-2'>¡Bienvenido!</h1>
        <p className='text-muted-foreground italic'>
          Inicia sesión para gestionar tu negocio en <span className='font-semibold text-orange'>{APP_NAME}</span>.
        </p>
      </div>

      {promo === 'PROMO2M' && (
        <div className='mb-8 p-4 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-2xl flex items-center gap-4 text-orange-800 text-sm font-bold animate-in fade-in zoom-in slide-in-from-top-4 duration-700 shadow-sm'>
          <div className='bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20 rotate-3'>
            <ShieldCheck className='w-5 h-5 text-white' />
          </div>
          <div className='flex flex-col'>
            <span className='text-[10px] uppercase tracking-tighter text-orange-600'>Beneficio Activado</span>
            <span>¡Código <strong>{promo}</strong> aplicado! 2 meses extra gratis.</span>
          </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type='hidden' name='callbackUrl' value={callbackUrl} />
          <div className='space-y-5'>
            <FormField
              control={control}
              name='email'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Correo Electrónico</FormLabel>
                  <FormControl>
                    <div className='relative group'>
                      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange'>
                        <Mail className='w-4 h-4' />
                      </div>
                      <Input
                        data-testid="sign-in-email-input"
                        placeholder='ejemplo@correo.com'
                        {...field}
                        className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 transition-all shadow-sm'
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='password'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Contraseña</FormLabel>
                    <Link
                      href='/forgot-password'
                      className='text-xs font-medium text-orange hover:text-orange-600 transition-colors'
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <div className='relative group'>
                      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange'>
                        <KeyRound className='w-4 h-4' />
                      </div>
                      <Input
                        data-testid="sign-in-password-input"
                        type='password'
                        placeholder='••••••••'
                        {...field}
                        className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 transition-all shadow-sm'
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <div className='pt-2'>
              <Button
                data-testid="sign-in-submit-button"
                type='submit'
                disabled={isLoading}
                className='w-full h-11 bg-orange hover:bg-orange-600 text-white font-bold text-base transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg'
              >
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Iniciando...</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <span>Entrar ahora</span>
                    <ArrowRight className='w-4 h-4' />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>

  )
}