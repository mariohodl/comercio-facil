'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomH2 } from '@/components/shared/CustomH2'
import { CustomP } from '@/components/shared/CustomP'
import Link from 'next/link'
import Image from 'next/image'
import { APP_NAME } from '@/lib/constants'
import { resendVerificationCode } from '@/lib/email/verification'
import { verifyUserEmail } from '@/lib/actions/email.actions'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email') || ''

    const [code, setCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        if (code.length !== 6) {
            toast.error('Por favor ingresa un código de 6 dígitos')
            return
        }

        setIsVerifying(true)
        try {
            const result = await verifyUserEmail(email, code)

            if (result.success) {
                toast.success(result.message || '¡Email verificado exitosamente!')

                // Redirect based on server response
                setTimeout(() => {
                    const url = result.shouldRedirect || '/admin/setup'
                    router.push(url)
                }, 1500)
            } else {
                toast.error(result.error || 'Código inválido o expirado')

                // If user not found, redirect to sign-up
                if (result.shouldRedirect) {
                    const fallback = result.shouldRedirect;
                    setTimeout(() => {
                        router.push(fallback as string);
                    }, 2000)
                }
            }
        } catch (error) {
            console.error('Verification error:', error)
            toast.error('Error al verificar el código')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResend = async () => {
        if (countdown > 0) return

        setIsResending(true)
        try {
            const result = await resendVerificationCode(email)

            if (result.success) {
                toast.success('Código reenviado exitosamente')
                setCountdown(60) // 60 seconds cooldown
            } else {
                toast.error('Error al reenviar el código')
            }
        } catch (error) {
            toast.error('Error al reenviar el código')
        } finally {
            setIsResending(false)
        }
    }

    if (!email) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <CustomH2>Email no proporcionado</CustomH2>
                    <Link href="/sign-up" className="text-orange hover:underline">
                        Volver al registro
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <section className='flex w-full min-h-screen'>
            <article className='w-full lg:w-1/2 px-6 md:px-16 lg:px-28 py-10 lg:py-20 flex flex-col justify-center'>
                <div className='w-full max-w-md mx-auto'>
                    <div className='flex justify-center mb-8'>
                        <Link href="/">
                            <Image
                                src="/images/app-logo.png"
                                alt={APP_NAME}
                                width={270}
                                height={100}
                                priority
                                className="hover:opacity-80 transition-opacity"
                            />
                        </Link>
                    </div>

                    <div className='text-center mb-8'>
                        <div className='flex justify-center mb-4'>
                            <div className='bg-orange/10 p-4 rounded-full'>
                                <Mail className='w-12 h-12 text-orange' />
                            </div>
                        </div>
                        <CustomH2>Verifica tu email</CustomH2>
                        <CustomP>
                            Hemos enviado un código de verificación de 6 dígitos a:
                        </CustomP>
                        <p className='font-bold text-lg mt-2'>{email}</p>
                    </div>

                    <form onSubmit={handleVerify} className='space-y-6'>
                        <div>
                            <label className='block text-sm font-medium mb-2'>
                                Código de verificación
                            </label>
                            <Input
                                type='text'
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder='000000'
                                className='text-center text-2xl tracking-widest font-mono'
                                maxLength={6}
                                autoFocus
                            />
                            <p className='text-xs text-gray-500 mt-2'>
                                El código expira en 24 horas
                            </p>
                        </div>

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isVerifying || code.length !== 6}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className='w-4 h-4 mr-2' />
                                    Verificar Email
                                </>
                            )}
                        </Button>

                        <div className='text-center'>
                            <p className='text-sm text-gray-600 mb-2'>
                                ¿No recibiste el código?
                            </p>
                            <Button
                                type='button'
                                variant='ghost'
                                onClick={handleResend}
                                disabled={isResending || countdown > 0}
                                className='text-orange hover:text-orange-dark'
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                        Reenviando...
                                    </>
                                ) : countdown > 0 ? (
                                    `Reenviar en ${countdown}s`
                                ) : (
                                    'Reenviar código'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className='mt-8 text-center text-sm text-gray-500'>
                        <Link href='/sign-in' className='text-orange hover:underline'>
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </article>

            <div className='hidden lg:block w-1/2 relative'>
                <Image
                    src={'/images/register-img.jpg'}
                    alt={'verify email'}
                    className='object-cover'
                    fill
                    priority
                />
            </div>
        </section>
    )
}
