'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StoreSettingsSchema } from '@/lib/validator'
import { updateStoreSettings } from '@/lib/actions/user.actions'
import { sendPhoneVerificationSMS, verifyPhoneOTP } from '@/lib/actions/phone.actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useSession, signOut } from 'next-auth/react'
import {
    LogOut, Loader2, Sparkles, Phone,
    CheckCircle2, RefreshCw, ArrowRight, MessageSquare, Pencil, AlertCircle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { IndustryAutocomplete } from '@/components/shared/industry-autocomplete'

interface CompanySettingsModalProps {
    isOpen: boolean
    userId: string
}

type ModalStep = 'setup' | 'verify'

export default function CompanySettingsModal({ isOpen }: CompanySettingsModalProps) {
    const [open, setOpen] = useState(isOpen)
    const [step, setStep] = useState<ModalStep>('setup')
    const [isLoading, setIsLoading] = useState(false)
    const [storeSlug, setStoreSlug] = useState('')

    // Phone / OTP state
    const [editPhone, setEditPhone] = useState('')             // input when changing phone on verify screen
    const [activePhone, setActivePhone] = useState('')         // phone currently being verified
    const [isChangingPhone, setIsChangingPhone] = useState(false)
    const [smsSent, setSmsSent] = useState(false)              // was the initial SMS sent successfully?
    const [smsError, setSmsError] = useState('')               // SMS error message if it failed

    const [otpCode, setOtpCode] = useState('')
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
    const [smsCountdown, setSmsCountdown] = useState(0)
    const [isSending, setIsSending] = useState(false)
    const hasAutoSent = useRef(false) // use ref to be immediate and survive re-renders within same mount

    const { showSuccess, showError } = useToast()
    const router = useRouter()
    const { data: session, update } = useSession()
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')

    const userName = session?.user?.name || ''

    useEffect(() => { setOpen(isOpen) }, [isOpen])

    // Countdown timer
    useEffect(() => {
        if (smsCountdown <= 0) return
        const timer = setTimeout(() => setSmsCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [smsCountdown])

    // ── Shared send SMS (used for first send and resend/change) ───────────────
    const doSendSMS = useCallback(async (phone: string): Promise<boolean> => {
        setIsSending(true)
        setSmsError('')
        try {
            const res = await sendPhoneVerificationSMS(phone)
            if (res.success) {
                setActivePhone(phone)
                setSmsCountdown(60)
                setSmsSent(true)
                return true
            } else {
                setSmsError(res.error || 'No pudimos enviar el SMS. Verifica el número e intenta de nuevo.')
                setSmsSent(false)
                return false
            }
        } catch {
            setSmsError('Error al enviar el SMS. Intenta de nuevo.')
            setSmsSent(false)
            return false
        } finally {
            setIsSending(false)
        }
    }, [])

    useEffect(() => {
        if (session?.user?.storeId && !session?.user?.phoneVerified && session?.user?.phone) {
            const rawPhone = session.user.phone.replace('+52', '')
            setStep('verify')
            setStoreSlug(session.user.storeId)
            setActivePhone(rawPhone)
            setEditPhone(rawPhone)
            // We NO LONGER auto-send SMS here to avoid infinite loops with Next.js re-renders.
            // The UI will show a "Send Code" button if smsSent is false.
        }
    }, [session?.user?.storeId, session?.user?.phoneVerified, session?.user?.phone])

    const generateStoreId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        return Array.from({ length: 8 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('')
    }

    const form = useForm<z.infer<typeof StoreSettingsSchema>>({
        resolver: zodResolver(StoreSettingsSchema),
        defaultValues: {
            companyName: '',
            storeName: '',
            storeLocation: '',
            warehouseName: '',
            warehouseLocation: '',
            storeId: generateStoreId(),
            industry: 'general',
            phone: '',
        },
    })

    // ── Shared send SMS (used for first send and resend/change) ───────────────


    // ── Step 1: Save store + attempt SMS, always go to verify step ────────────
    const onSubmit = async (data: z.infer<typeof StoreSettingsSchema>) => {
        setIsLoading(true)
        try {
            // 1. Save store settings (saves unverified phone to DB)
            const res = await updateStoreSettings(data)
            if (!res.success || !res.data) {
                showError(t('saveError'))
                return
            }
            await update({
                user: {
                    storeId: res.data.storeId,
                    storeName: res.data.storeName,
                    companyId: res.data.companyId,
                    companyName: res.data.companyName,
                    isStore: true,
                },
            })
            setStoreSlug(res.data.storeId)

            // 2. Attempt SMS using form data
            await doSendSMS(data.phone)
            setEditPhone(data.phone)   // pre-fill change-phone input with setup value
            setStep('verify')
        } catch (e) {
            console.error(e)
            showError(tCommon('unexpectedError'))
        } finally {
            setIsLoading(false)
        }
    }

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────
    const handleVerifyOTP = async () => {
        if (otpCode.length < 6) {
            showError('Ingresa el código de 6 dígitos')
            return
        }
        setIsVerifyingOTP(true)
        try {
            const res = await verifyPhoneOTP(activePhone, otpCode.trim())
            if (res.success) {
                showSuccess('¡Celular verificado! Bienvenido a Comercio Fácil 🎉')
                // 1. Trigger session update (refetch from DB in jwt callback)
                await update()
                // 2. Refresh current page/router view
                router.refresh()
                setOpen(false)
                // 3. Small delay to let cookie settle before redirect
                setTimeout(() => {
                    router.push(`/admin/${storeSlug}/overview?verified=1`)
                }, 200)
            } else {
                showError(res.error || 'Código incorrecto')
            }
        } catch {
            showError('Error al verificar el código')
        } finally {
            setIsVerifyingOTP(false)
        }
    }

    // ── Step 2: Resend to same active phone ───────────────────────────────────
    const handleResend = async () => {
        if (smsCountdown > 0 || isSending) return
        const ok = await doSendSMS(activePhone)
        if (ok) showSuccess('Código reenviado correctamente')
    }

    // ── Step 2: Send to new phone number ─────────────────────────────────────
    const handleChangePhone = async () => {
        const digits = editPhone.replace(/\D/g, '')
        if (digits.length !== 10) {
            showError('Ingresa exactamente 10 dígitos')
            return
        }
        setOtpCode('')  // clear OTP when changing phone
        const ok = await doSendSMS(digits)
        if (ok) {
            setIsChangingPhone(false)
            showSuccess(`Código enviado a +52 ${digits}`)
        }
    }

    const currentPhone = form.watch('phone')

    const formattedDisplay = (phone: string) =>
        phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={() => { }} modal={false}>
            {open && <div className="fixed inset-0 z-50 bg-black/50" aria-hidden="true" />}

            <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] w-[98vw] max-w-[95vw] sm:max-w-[550px] p-0 border-none shadow-2xl max-h-[96vh] sm:max-h-[90vh] flex flex-col rounded-xl bg-white focus:outline-none overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 shrink-0" />

                {/* ── STEP 1: Setup Form ──────────────────────────────────── */}
                {step === 'setup' && (
                    <>
                        {/* Header */}
                        <div className="relative pt-5 pb-3 px-6 shrink-0">
                            <DialogHeader className="relative z-10 flex flex-row items-center gap-3">
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-orange-400 to-orange-200 opacity-40 blur animate-pulse" />
                                    <div className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
                                        <Sparkles className="w-5 h-5 text-orange-500" />
                                    </div>
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                                        {userName
                                            ? <>¡Hola <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">{userName.split(' ')[0]}</span>!</>
                                            : t('companySettingsTitle')}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 text-xs leading-snug mt-0.5">
                                        {t('setupInstructions')}
                                    </DialogDescription>
                                </div>
                            </DialogHeader>
                        </div>

                        {/* Form */}
                        <div className="px-6 flex-1 overflow-y-auto">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField control={form.control} name="companyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                                    {t('fields.companyName')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input data-testid="setup-company-name-input"
                                                        placeholder={t('placeholders.companyName')} {...field}
                                                        className="h-10 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="storeName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                                        {t('fields.storeName')}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input data-testid="setup-store-name-input"
                                                            placeholder={t('placeholders.storeName')} {...field}
                                                            className="h-10 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField control={form.control} name="warehouseName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                                        {t('fields.warehouseName')}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input data-testid="setup-warehouse-name-input"
                                                            placeholder={t('placeholders.warehouseName')} {...field}
                                                            className="h-10 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField control={form.control} name="industry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                                    {t('fields.industry')}
                                                </FormLabel>
                                                <FormControl>
                                                    <IndustryAutocomplete
                                                        data-testid="setup-industry-select"
                                                        value={field.value}
                                                        onChange={(slug) => field.onChange(slug)}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Phone */}
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5 pb-2">
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                                                    Celular para notificaciones
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                                                            <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                                            <span className="text-sm font-semibold text-gray-400 group-focus-within:text-orange-500 transition-colors">+52</span>
                                                        </div>
                                                        <Input
                                                            data-testid="setup-phone-input"
                                                            placeholder="3331005403"
                                                            {...field}
                                                            onChange={(e) => {
                                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                                field.onChange(digits)
                                                            }}
                                                            className="pl-[4.5rem] h-10 border-gray-200 focus:border-orange bg-gray-50/30 shadow-sm"
                                                            type="tel"
                                                            inputMode="numeric"
                                                            maxLength={10}
                                                        />
                                                        {field.value?.length > 0 && (
                                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${field.value?.length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                                                                {field.value?.length}/10
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <p className="text-[10px] text-slate-400">
                                                    Te enviaremos un SMS para verificar tu número al guardar.
                                                </p>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Footer */}
                                    <div className="pt-2 pb-5 border-t border-gray-100 flex flex-col sm:flex-row-reverse gap-3 sm:justify-start items-center">
                                        <Button
                                            data-testid="setup-submit-button"
                                            type="submit"
                                            disabled={isLoading}
                                            className="h-10 w-full sm:w-auto px-6 bg-orange hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                            ) : (
                                                <><ArrowRight className="w-4 h-4" /> Guardar y verificar celular</>
                                            )}
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm"
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="w-full sm:w-auto text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {tCommon('signOut')}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </>
                )}

                {/* ── STEP 2: Phone Verification ──────────────────────────── */}
                {step === 'verify' && (
                    <div className="flex flex-col flex-1 px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-400 overflow-y-auto">

                        {/* Header row */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="relative shrink-0">
                                <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-orange-400 to-orange-200 opacity-40 blur animate-pulse" />
                                <div className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
                                    <MessageSquare className="w-5 h-5 text-orange-500" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                    Verifica tu celular
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Ingresa el código que te enviamos por SMS
                                </p>
                            </div>
                        </div>

                        {/* SMS status & Initial Send Button */}
                        {smsSent ? (
                            <div className="flex items-center gap-2 text-xs text-slate-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5 mb-5">
                                <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <span>
                                    Código enviado a{' '}
                                    <strong className="text-orange-700">+52 {formattedDisplay(activePhone)}</strong>
                                </span>
                            </div>
                        ) : (
                            <div className="mb-5">
                                {smsError ? (
                                    <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>{smsError}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 mb-3">
                                        <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>Confirma tu número <strong>+52 {formattedDisplay(activePhone)}</strong> para recibir el código.</span>
                                    </div>
                                )}
                                {!isChangingPhone && (
                                    <Button
                                        type="button"
                                        onClick={() => doSendSMS(activePhone)}
                                        disabled={isSending}
                                        className="w-full h-11 bg-orange hover:bg-orange-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isSending ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                        ) : (
                                            <><MessageSquare className="w-4 h-4" /> Enviar código de verificación</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* OTP input (only shown if SMS was sent) */}
                        {smsSent && !isChangingPhone && (
                            <div className="space-y-3 mb-4">
                                <Input
                                    data-testid="setup-otp-input"
                                    placeholder="• • • • • •"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="h-14 text-center text-2xl font-bold tracking-[0.5em] border-2 border-gray-200 focus:border-orange-400 bg-gray-50 rounded-xl"
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoFocus
                                />
                                <Button
                                    data-testid="setup-verify-otp-button"
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    disabled={isVerifyingOTP || otpCode.length < 6}
                                    className="w-full h-11 bg-orange hover:bg-orange-600 text-white font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isVerifyingOTP
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                                        : <><CheckCircle2 className="w-4 h-4" /> Confirmar código</>
                                    }
                                </Button>

                                {/* Resend */}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={smsCountdown > 0 || isSending}
                                    className="w-full flex items-center justify-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium py-1"
                                >
                                    {isSending
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <RefreshCw className="w-3.5 h-3.5" />
                                    }
                                    {smsCountdown > 0 ? `Reenviar en ${smsCountdown}s` : 'Reenviar código'}
                                </button>
                            </div>
                        )}

                        {/* Change phone section */}
                        {!isChangingPhone ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditPhone(activePhone || currentPhone)
                                    setIsChangingPhone(true)
                                }}
                                className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1 w-full"
                            >
                                <Pencil className="w-3 h-3" />
                                Usar otro número de celular
                            </button>
                        ) : (
                            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Cambiar número
                                </p>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                                        <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                        <span className="text-sm font-semibold text-gray-400 group-focus-within:text-orange-500 transition-colors">+52</span>
                                    </div>
                                    <Input
                                        placeholder="3331005403"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="pl-[4.5rem] h-10 border-gray-200 focus:border-orange bg-white shadow-sm"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        autoFocus
                                    />
                                    {editPhone.length > 0 && (
                                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${editPhone.length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                                            {editPhone.length}/10
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleChangePhone}
                                        disabled={editPhone.length !== 10 || isSending}
                                        className="flex-1 h-9 bg-orange hover:bg-orange-600 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-1.5"
                                    >
                                        {isSending
                                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</>
                                            : <><RefreshCw className="w-3.5 h-3.5" /> Enviar código</>
                                        }
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsChangingPhone(false)}
                                        className="h-9 px-3 text-sm text-gray-400 hover:text-gray-600"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step indicator */}
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <div className="w-6 h-2 rounded-full bg-orange-500" />
                        </div>
                    </div>
                )}
            </DialogPrimitive.Content>
        </Dialog>
    )
}
