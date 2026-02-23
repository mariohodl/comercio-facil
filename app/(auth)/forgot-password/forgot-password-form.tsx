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
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { requestPasswordReset } from '@/lib/actions/user.actions'
import { toast } from 'sonner'

const ForgotPasswordSchema = z.object({
    email: z.string().email('Introduce un correo válido'),
})

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
        if (isLoading) return
        setIsLoading(true)
        try {
            const res = await requestPasswordReset(values.email)
            if (res.success) {
                setIsSubmitted(true)
                // @ts-ignore
                toast.success(res.message)
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

    if (isSubmitted) {
        return (
            <div className='text-center space-y-4'>
                <div className='bg-orange/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto'>
                    <Mail className='w-8 h-8 text-orange' />
                </div>
                <h3 className='text-xl font-bold text-gray-900'>¡Correo enviado!</h3>
                <p className='text-gray-600'>
                    Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.
                </p>
            </div>
        )
    }

    return (
        <section className='animate-in fade-in slide-in-from-bottom-4 duration-500 text-left'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-2'>
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className='text-muted-foreground italic'>
                    No te preocupes, te enviaremos instrucciones para recuperarla.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-xs font-bold text-gray-500 uppercase tracking-widest'>
                                    Correo Electrónico
                                </FormLabel>
                                <FormControl>
                                    <div className='relative group'>
                                        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange transition-colors'>
                                            <Mail className='w-4 h-4' />
                                        </div>
                                        <Input
                                            data-testid="forgot-password-email-input"
                                            placeholder='tu@ejemplo.com'
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
                        data-testid="forgot-password-submit-button"
                        type='submit'
                        disabled={isLoading}
                        className='w-full h-11 bg-orange hover:bg-orange-600 text-white font-bold text-base transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg rounded-xl'
                    >
                        {isLoading ? (
                            <div className='flex items-center gap-2'>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                <span>Enviando...</span>
                            </div>
                        ) : (
                            <div className='flex items-center gap-2'>
                                <span>Enviar enlace de recuperación</span>
                                <ArrowRight className='w-4 h-4' />
                            </div>
                        )}
                    </Button>
                </form>
            </Form>
        </section>
    )
}
