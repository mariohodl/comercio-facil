'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Lock, KeyRound, Loader2, ArrowRight } from 'lucide-react'
import { resetPassword } from '@/lib/actions/user.actions'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

const ResetPasswordSchema = z.object({
    password: z.string().min(3, 'La contraseña debe tener al menos 3 caracteres'),
    confirmPassword: z.string().min(3, 'La contraseña debe tener al menos 3 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ['confirmPassword'],
})

export default function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
        if (!token || !email) {
            toast.error('Token o correo inválido. Por favor solicita un nuevo enlace.')
            return
        }

        if (isLoading) return
        setIsLoading(true)
        try {
            const res = await resetPassword({
                token,
                email,
                password: values.password,
                confirmPassword: values.confirmPassword,
            })

            if (res.success) {
                toast.success(res.message)
                router.push('/sign-in')
            } else {
                // @ts-ignore
                toast.error(res.error)
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado')
        } finally {
            setIsLoading(false)
        }
    }

    if (!token || !email) {
        return (
            <div className='text-center p-4 bg-red-50 text-red-600 rounded-xl border border-red-100'>
                <p>Este enlace no es válido o ha expirado. Por favor solicita uno nuevo.</p>
            </div>
        )
    }

    return (
        <section className='animate-in fade-in slide-in-from-bottom-4 duration-500 text-left'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-2'>
                    Nueva contraseña
                </h1>
                <p className='text-muted-foreground italic'>
                    Ingresa tu nueva contraseña a continuación para recuperar el acceso.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-xs font-bold text-gray-500 uppercase tracking-widest'>
                                    Nueva Contraseña
                                </FormLabel>
                                <FormControl>
                                    <div className='relative group'>
                                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                                            <Lock className='w-4 h-4' />
                                        </div>
                                        <Input
                                            data-testid="reset-password-new-password-input"
                                            type='password'
                                            placeholder='••••••••'
                                            {...field}
                                            className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='confirmPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-xs font-bold text-gray-500 uppercase tracking-widest'>
                                    Confirmar Contraseña
                                </FormLabel>
                                <FormControl>
                                    <div className='relative group'>
                                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                                            <KeyRound className='w-4 h-4' />
                                        </div>
                                        <Input
                                            data-testid="reset-password-confirm-password-input"
                                            type='password'
                                            placeholder='••••••••'
                                            {...field}
                                            className='pl-10 h-11 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm transition-all'
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        data-testid="reset-password-submit-button"
                        type='submit'
                        disabled={isLoading}
                        className='w-full h-11 bg-orange hover:bg-orange-600 text-white font-bold text-base transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg'
                    >
                        {isLoading ? (
                            <div className='flex items-center gap-2'>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                <span>Actualizando...</span>
                            </div>
                        ) : (
                            <div className='flex items-center gap-2'>
                                <span>Actualizar contraseña</span>
                                <ArrowRight className='w-4 h-4' />
                            </div>
                        )}
                    </Button>
                </form>
            </Form>
        </section>
    )
}
