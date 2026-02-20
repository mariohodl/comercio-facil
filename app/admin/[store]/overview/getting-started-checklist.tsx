'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    CheckCircle2,
    Circle,
    ShoppingBag,
    Package,
    Store,
    ArrowRight,
    Barcode,
    TrendingDown,
    Zap,
    BarChart3,
    ShieldCheck,
    LineChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GettingStartedChecklistProps {
    storeId: string
    hasProducts: boolean
    hasPurchases: boolean
    hasSales: boolean
}

export default function GettingStartedChecklist({
    storeId,
    hasProducts,
    hasPurchases,
    hasSales,
}: GettingStartedChecklistProps) {
    const t = useTranslations('admin.onboarding')
    const tCommon = useTranslations('common')

    // Track clicks for steps 2 and 3 if products already exist
    const [purchasesVisited, setPurchasesVisited] = React.useState(false)
    const [salesVisited, setSalesVisited] = React.useState(false)

    React.useEffect(() => {
        const p = localStorage.getItem(`onboarding_purchases_visited_${storeId}`)
        const s = localStorage.getItem(`onboarding_sales_visited_${storeId}`)
        if (p) setPurchasesVisited(true)
        if (s) setSalesVisited(true)
    }, [storeId])

    const handleStepClick = (stepId: string) => {
        if (!hasProducts) return
        if (stepId === 'purchases') {
            setPurchasesVisited(true)
            localStorage.setItem(`onboarding_purchases_visited_${storeId}`, 'true')
        }
        if (stepId === 'sales') {
            setSalesVisited(true)
            localStorage.setItem(`onboarding_sales_visited_${storeId}`, 'true')
        }
    }

    const steps = [
        {
            id: 'products',
            title: t('step1Title'),
            description: t('step1Description'),
            buttonText: t('step1Button'),
            href: `/admin/${storeId}/products/create`,
            icon: ShoppingBag,
            completed: hasProducts,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            id: 'purchases',
            title: t('step2Title'),
            description: t('step2Description'),
            buttonText: t('step2Button'),
            href: `/admin/${storeId}/purchases/create`,
            icon: Package,
            completed: hasPurchases || (hasProducts && purchasesVisited),
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            id: 'sales',
            title: t('step3Title'),
            description: t('step3Description'),
            buttonText: t('step3Button'),
            href: `/admin/pos/${storeId}`,
            icon: Store,
            completed: hasSales || (hasProducts && salesVisited),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ]

    const completedCount = steps.filter((s) => s.completed).length
    const progress = (completedCount / steps.length) * 100
    const isAllFinished = completedCount === steps.length

    return (
        <div className="space-y-4 max-w-4xl mx-auto py-2 lg:py-6">
            {isAllFinished && (
                <Card
                    data-testid="onboarding-completion-card"
                    className="bg-emerald-50 border-emerald-100 mb-8 overflow-hidden relative shadow-sm"
                >
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md mb-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-navy">{t('allStepsCompleted')}</h2>
                        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                            {t('allStepsDescription')}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="pt-2 pb-6 text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-navy">
                    {t('checklistTitle')}
                </h1>

                <p className="text-slate-500 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                    {t('checklistDescription')}
                </p>
            </div>

            <div className="grid gap-6">
                {steps.map((step, index) => {
                    const isActive = !step.completed && index === completedCount

                    return (
                        <Card
                            key={step.id}
                            data-testid={`onboarding-step-${step.id}`}
                            className={cn(
                                "relative overflow-hidden border transition-all duration-300",
                                step.completed
                                    ? 'border-slate-100 bg-slate-50/30 opacity-60'
                                    : isActive
                                        ? 'border-orange-200 shadow-md bg-white ring-1 ring-orange-100/50'
                                        : 'border-slate-100 hover:border-slate-200'
                            )}
                        >
                            {step.completed && (
                                <div className="absolute top-0 right-0 p-4">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                </div>
                            )}

                            {isActive && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex h-3 w-3 relative">
                                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></div>
                                        <div className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></div>
                                    </div>
                                </div>
                            )}

                            <CardContent className="p-3 lg:p-4">
                                <div className="flex items-center gap-3 lg:gap-5">
                                    <div className={cn(
                                        "flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl transition-all duration-500",
                                        step.bgColor,
                                        step.color,
                                        isActive && "ring-2 ring-orange/20"
                                    )}>
                                        <step.icon className={cn("h-5 w-5 lg:h-6 lg:w-6")} />
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider",
                                                isActive ? "text-orange" : "text-slate-400"
                                            )}>
                                                {isActive ? t('nextStep') : `${t('step')} ${index + 1}`}
                                            </span>
                                        </div>
                                        <CardTitle className="text-sm lg:text-base font-bold text-navy leading-tight">{step.title}</CardTitle>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {step.description}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        <Button
                                            asChild
                                            disabled={step.completed}
                                            data-testid={`onboarding-step-button-${step.id}`}
                                            variant={step.completed ? "ghost" : isActive ? "default" : "secondary"}
                                            className={cn(
                                                "h-9 lg:h-10 px-4 lg:px-5 text-xs lg:text-sm font-bold transition-all active:scale-95 group rounded-lg",
                                                isActive
                                                    ? "bg-orange hover:bg-orange-dark text-white shadow-sm shadow-orange/10 border-none"
                                                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-none"
                                            )}
                                        >
                                            <Link href={step.href} onClick={() => handleStepClick(step.id)}>
                                                <span>{step.buttonText}</span>
                                                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="mt-8 space-y-3 bg-slate-50/50 p-4 lg:p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Roadmap</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">Progreso:</span>
                        <span className="text-xs font-bold text-orange">{Math.round(progress)}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    {[
                        { label: 'Catálogo', active: hasProducts, icon: Barcode },
                        { label: 'Stock', active: steps[1].completed, icon: TrendingDown },
                        { label: 'Terminal', active: steps[2].completed, icon: Zap },
                        { label: 'Métricas', active: steps[2].completed, icon: LineChart },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border transition-all duration-300",
                                item.active
                                    ? "bg-white border-slate-200 shadow-sm"
                                    : "bg-slate-100/30 border-transparent opacity-40 grayscale"
                            )}
                        >
                            <div className={cn(
                                "h-6 w-6 rounded flex items-center justify-center shrink-0",
                                item.active ? "bg-slate-100 text-navy" : "bg-slate-200 text-slate-400"
                            )}>
                                <item.icon className="h-3 w-3" />
                            </div>
                            <span className={cn(
                                "text-[10px] lg:text-xs font-bold",
                                item.active ? "text-navy" : "text-slate-500"
                            )}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden mt-4">
                    <div
                        className="h-full bg-orange transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
