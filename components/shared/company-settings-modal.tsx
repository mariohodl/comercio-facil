'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StoreSettingsSchema } from '@/lib/validator'
import { updateStoreSettings } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
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
import { LogOut, Store, Save, Loader2, Sparkles } from 'lucide-react'

import { useTranslations } from 'next-intl'
import { IndustryAutocomplete } from '@/components/shared/industry-autocomplete'

interface CompanySettingsModalProps {
    isOpen: boolean
    userId: string
}

export default function CompanySettingsModal({ isOpen }: CompanySettingsModalProps) {
    const [open, setOpen] = useState(isOpen)
    const [isLoading, setIsLoading] = useState(false)
    const { showSuccess, showError } = useToast()
    const router = useRouter()
    const { data: session, update } = useSession()
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')

    const userName = session?.user?.name || ''

    // Generate random 8-character alphanumeric store ID
    const generateStoreId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
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
        },
    })

    useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    const onSubmit = async (data: z.infer<typeof StoreSettingsSchema>) => {
        setIsLoading(true)
        try {
            const res = await updateStoreSettings(data)
            if (res.success && res.data) {
                await update({
                    user: {
                        storeId: res.data.storeId,
                        storeName: res.data.storeName,
                        companyId: res.data.companyId,
                        companyName: res.data.companyName,
                        isStore: true
                    }
                })
                showSuccess(t('saveSuccess'))
                setOpen(false)
                router.push(`/admin/${data.storeId}/overview`)
            } else {
                showError(t('saveError'))
            }
        } catch (error) {
            console.error(error)
            showError(tCommon('unexpectedError'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { }} modal={false}>
            {/* Custom overlay — modal={false} disables Radix focus trap & inert, so we add visual overlay manually */}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/50" aria-hidden="true" />
            )}
            <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] w-[98vw] max-w-[95vw] sm:max-w-[550px] p-0 border-none shadow-2xl max-h-[96vh] sm:max-h-[90vh] flex flex-col gap-0 rounded-xl bg-white focus:outline-none overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Thin accent line at the very top */}
                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 shrink-0" />

                <div className="relative pt-8 pb-4 px-6 text-center sm:text-left shrink-0">
                    {/* Subtle background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-100/40 blur-3xl rounded-full pointer-events-none"></div>

                    <DialogHeader className="relative z-10 flex flex-col items-center sm:items-start gap-4">
                        <div className="relative mb-2">
                            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-orange-400 to-orange-200 opacity-40 blur animate-pulse" />
                            <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-orange-100 transition-transform hover:scale-110 duration-300">
                                <Sparkles className="w-7 h-7 text-orange-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                                {userName ? (
                                    <>
                                        ¡Hola <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">{userName.split(' ')[0]}</span>!
                                    </>
                                ) : t('companySettingsTitle')}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-[400px]">
                                {t('setupInstructions')}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-6 bg-white flex-1 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{t('fields.companyName')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                data-testid="setup-company-name-input"
                                                placeholder={t('placeholders.companyName')}
                                                {...field}
                                                className="h-10 border-gray-200 focus:border-orange bg-gray-50/30 transition-all shadow-sm"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="storeName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{t('fields.storeName')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    data-testid="setup-store-name-input"
                                                    placeholder={t('placeholders.storeName')}
                                                    {...field}
                                                    className="h-10 border-gray-200 focus:border-orange bg-gray-50/30 transition-all shadow-sm"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="warehouseName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{t('fields.warehouseName')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    data-testid="setup-warehouse-name-input"
                                                    placeholder={t('placeholders.warehouseName')}
                                                    {...field}
                                                    className="h-10 border-gray-200 focus:border-orange bg-gray-50/30 transition-all shadow-sm"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pb-2">
                                <FormField
                                    control={form.control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{t('fields.industry')}</FormLabel>
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
                            </div>

                            <DialogFooter className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row-reverse gap-3 sm:justify-start items-center pb-4">
                                <Button
                                    data-testid="setup-submit-button"
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-10 w-full sm:w-auto px-6 bg-orange hover:bg-orange-600 text-white font-bold text-sm transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {tCommon('saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            ¡Listo! Empezar ahora
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full sm:w-auto text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="">{tCommon('signOut')}</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogPrimitive.Content>
        </Dialog>
    )
}
