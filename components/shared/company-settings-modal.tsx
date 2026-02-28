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
import { LogOut, Store, Save, Loader2 } from 'lucide-react'

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
                <div className="bg-orange p-4 sm:p-5 text-white shrink-0 rounded-t-xl overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="bg-white/20 rounded-lg p-1 shrink-0">
                                <Store className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            {userName ? t('welcomeTitle', { name: userName }) : t('companySettingsTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-orange-100 text-xs font-medium mt-1">
                            {t('setupInstructions')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-4 sm:p-6 bg-white rounded-b-xl flex-1 overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('fields.companyName')}</FormLabel>
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
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('fields.storeName')}</FormLabel>
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
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('fields.warehouseName')}</FormLabel>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-2 items-end">
                                <FormField
                                    control={form.control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('fields.industry')}</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="storeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('fields.storeIdGenerated')}</FormLabel>
                                            <FormControl>
                                                <div className="flex h-10 w-full items-center justify-start rounded-md border border-gray-200 bg-gray-100/50 px-3 py-2 text-sm font-mono tracking-widest text-gray-500 transition-all shadow-sm select-none">
                                                    {field.value}
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="mt-6 pt-4 border-t border-gray-100 flex flex-row gap-3 justify-between items-center pb-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="">{tCommon('signOut')}</span>
                                </Button>
                                <Button
                                    data-testid="setup-submit-button"
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-10 px-6 bg-orange hover:bg-orange-600 text-white font-bold text-sm transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {tCommon('saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {t('saveContinue')}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogPrimitive.Content>
        </Dialog>
    )
}
