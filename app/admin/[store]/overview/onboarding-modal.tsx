'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, ShoppingBag, Package, Store } from 'lucide-react'

interface OnboardingModalProps {
    storeId: string
}

export default function OnboardingModal({ storeId }: OnboardingModalProps) {
    const t = useTranslations('admin.onboarding')
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const onboardingStatus = localStorage.getItem(`onboarding_seen_${storeId}`)

        // If permanently dismissed, don't show
        if (onboardingStatus === 'permanent' || onboardingStatus === 'true') return

        let shouldShow = !onboardingStatus

        if (onboardingStatus) {
            const lastSkipped = parseInt(onboardingStatus, 10)
            if (!isNaN(lastSkipped)) {
                const twentyFourHours = 24 * 60 * 60 * 1000
                if (Date.now() - lastSkipped > twentyFourHours) {
                    shouldShow = true
                }
            }
        }

        if (shouldShow) {
            // Small delay to let the page settle
            const timer = setTimeout(() => {
                setOpen(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [storeId])

    const handleGetStarted = () => {
        localStorage.setItem(`onboarding_seen_${storeId}`, 'permanent')
        window.dispatchEvent(new Event('onboarding-started'))
        setOpen(false)
    }

    const handleSkip = () => {
        localStorage.setItem(`onboarding_seen_${storeId}`, Date.now().toString())
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] border-none bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 shadow-2xl p-0 overflow-y-auto max-h-[96vh] sm:max-h-[90vh]">
                <div className="h-2 bg-gradient-to-r from-orange-500 via-emerald-500 to-blue-500 shrink-0" />

                <div className="p-5 sm:p-8">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 to-emerald-400 opacity-75 blur animate-pulse" />
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl">
                                <Sparkles className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    <DialogHeader className="text-center space-y-3">
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight text-center">
                            {t('welcomeTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-base text-slate-600 dark:text-slate-400  max-w-sm mx-auto">
                            {t('welcomeDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 grid gap-4">
                        <div className="relative p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-orange-100 transition-all hover:shadow-md group">
                            <div className="absolute top-0 right-0 flex h-8 w-10 items-center justify-center rounded-tr-2xl rounded-bl-2xl bg-orange-50 text-orange-600 text-xs font-black group-hover:bg-orange-100 transition-colors">
                                1
                            </div>
                            <div className="text-left space-y-1 pr-6">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t('step1Title')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{t('step1Description')}</p>
                            </div>
                        </div>

                        <div className="relative p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-100 transition-all hover:shadow-md group">
                            <div className="absolute top-0 right-0 flex h-8 w-10 items-center justify-center rounded-tr-2xl rounded-bl-2xl bg-emerald-50 text-emerald-600 text-xs font-black group-hover:bg-emerald-100 transition-colors">
                                2
                            </div>
                            <div className="text-left space-y-1 pr-6">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t('step2Title')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{t('step2Description')}</p>
                            </div>
                        </div>

                        <div className="relative p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-blue-100 transition-all hover:shadow-md group">
                            <div className="absolute top-0 right-0 flex h-8 w-10 items-center justify-center rounded-tr-2xl rounded-bl-2xl bg-blue-50 text-blue-600 text-xs font-black group-hover:bg-blue-100 transition-colors">
                                3
                            </div>
                            <div className="text-left space-y-1 pr-6">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t('step3Title')}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{t('step3Description')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Button
                            onClick={handleGetStarted}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-300 active:scale-[0.98]"
                        >
                            {t('getStarted')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="w-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {t('skipForNow')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
