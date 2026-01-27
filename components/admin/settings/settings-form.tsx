'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StoreSettingsSchema } from '@/lib/validator'
import { updateStoreSettings, getStoreSettings } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'
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
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, CreditCard, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

export default function SettingsForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const { showSuccess, showError } = useToast()
    const t = useTranslations('settings')
    const locale = useLocale()
    const dateLocale = locale === 'es' ? es : enUS

    const form = useForm<z.infer<typeof StoreSettingsSchema>>({
        resolver: zodResolver(StoreSettingsSchema),
        defaultValues: {
            companyName: '',
            storeName: '',
            storeLocation: '',
            warehouseName: '',
            warehouseLocation: '',
            storeId: '',
            taxId: '',
            plan: 'BASIC',
            planStatus: 'FREE_TRIAL',
            trialEndDate: null,
            subscriptionEndDate: null,
        },
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getStoreSettings()
                if (res.success && res.data) {
                    form.reset(res.data)
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setIsFetching(false)
            }
        }
        fetchSettings()
    }, [form])

    const onSubmit = async (data: z.infer<typeof StoreSettingsSchema>) => {
        setIsLoading(true)
        try {
            const res = await updateStoreSettings(data)
            if (res.success) {
                showSuccess(t('successMessage'))
            } else {
                showError(res.error || 'Something went wrong')
            }
        } catch (error) {
            console.error(error)
            showError('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange" />
            </div>
        )
    }

    const { plan, planStatus, trialEndDate, subscriptionEndDate } = form.getValues()

    // Alert logic
    const today = new Date()
    const trialDate = trialEndDate ? new Date(trialEndDate) : null
    const subDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null

    const isTrialEndingSoon = trialDate &&
        (trialDate.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 7 &&
        trialDate.getTime() > today.getTime()

    const isTrialExpired = trialDate && trialDate.getTime() <= today.getTime()
    const isSubExpired = subDate && subDate.getTime() <= today.getTime()

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Alerts */}
                {(isTrialEndingSoon || isTrialExpired || isSubExpired) && (
                    <div className="space-y-4">
                        {isTrialEndingSoon && (
                            <Alert className="bg-orange-50 border-orange/50">
                                <AlertTriangle className="h-4 w-4 text-orange" />
                                <AlertTitle className="text-orange-900 font-bold">{t('trialEnding')}</AlertTitle>
                                <AlertDescription className="text-orange-800">
                                    {t('trialEnds')} {trialDate && format(trialDate, 'PPP', { locale: dateLocale })}
                                </AlertDescription>
                            </Alert>
                        )}
                        {isTrialExpired && planStatus === 'FREE_TRIAL' && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="font-bold">{t('trialExpired')}</AlertTitle>
                                <AlertDescription>
                                    {t('trialEnds')} {trialDate && format(trialDate, 'PPP', { locale: dateLocale })}.
                                    Please upgrade your plan to continue.
                                </AlertDescription>
                            </Alert>
                        )}
                        {isSubExpired && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="font-bold">{t('subscriptionExpired')}</AlertTitle>
                                <AlertDescription>
                                    Your subscription ended on {subDate && format(subDate, 'PPP', { locale: dateLocale })}.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Billing info */}
                    <Card className="shadow-sm border-gray-200 md:col-span-2 overflow-hidden">
                        <CardHeader className="bg-navy text-white pb-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-6 w-6" />
                                        {t('billingInfo')}
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Monitor your plan and subscription status
                                    </CardDescription>
                                </div>
                                <Badge className={cn(
                                    "px-4 py-1 text-sm font-bold capitalize",
                                    planStatus === 'ACTIVE' ? "bg-green-500 hover:bg-green-600" : "bg-orange hover:bg-orange-dark"
                                )}>
                                    {planStatus === 'FREE_TRIAL' ? t('freeTrial') : planStatus === 'ACTIVE' ? t('active') : t('expired')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('plan')}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-navy/5 rounded-lg">
                                            <Badge variant="outline" className="text-navy border-navy font-bold px-3">
                                                {plan}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                {trialDate && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('trialEnds')}</p>
                                        <div className="flex items-center gap-2 text-navy font-semibold">
                                            <Info className="h-4 w-4 text-orange" />
                                            {format(trialDate, 'PPP', { locale: dateLocale })}
                                        </div>
                                    </div>
                                )}
                                {subDate && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('subscriptionExpires')}</p>
                                        <div className="flex items-center gap-2 text-navy font-semibold">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {format(subDate, 'PPP', { locale: dateLocale })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company info */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50">
                            <CardTitle className="text-navy">{t('companyInfo')}</CardTitle>
                            <CardDescription>{t('manageSettings')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('companyName')}</FormLabel>
                                        <FormControl>
                                            <Input className="focus-visible:ring-orange" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('taxId')}</FormLabel>
                                        <FormControl>
                                            <Input className="focus-visible:ring-orange" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="storeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('storeId')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-50 border-gray-200 cursor-not-allowed" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Store info */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50">
                            <CardTitle className="text-navy">{t('storeInfo')}</CardTitle>
                            <CardDescription>{t('manageSettings')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="storeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('storeName')}</FormLabel>
                                        <FormControl>
                                            <Input className="focus-visible:ring-orange" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="storeLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('storeLocation')}</FormLabel>
                                        <FormControl>
                                            <Input className="focus-visible:ring-orange" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Warehouse info */}
                    <Card className="shadow-sm border-gray-200 md:col-span-2">
                        <CardHeader className="bg-gray-50/50">
                            <CardTitle className="text-navy">{t('warehouseInfo')}</CardTitle>
                            <CardDescription>{t('manageSettings')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="warehouseName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">{t('warehouseName')}</FormLabel>
                                            <FormControl>
                                                <Input className="focus-visible:ring-orange" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="warehouseLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">{t('warehouseLocation')}</FormLabel>
                                            <FormControl>
                                                <Input className="focus-visible:ring-orange" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-orange hover:bg-orange-dark text-white px-8 py-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-lg font-bold flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {t('updateSettings')}...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                {t('updateSettings')}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
