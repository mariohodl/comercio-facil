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

    // Track clicks for steps
    const [productsVisited, setProductsVisited] = React.useState(false)
    const [purchasesVisited, setPurchasesVisited] = React.useState(false)
    const [salesVisited, setSalesVisited] = React.useState(false)

    React.useEffect(() => {
        const prod = localStorage.getItem(`onboarding_products_visited_${storeId}`)
        const p = localStorage.getItem(`onboarding_purchases_visited_${storeId}`)
        const s = localStorage.getItem(`onboarding_sales_visited_${storeId}`)
        if (prod) setProductsVisited(true)
        if (p) setPurchasesVisited(true)
        if (s) setSalesVisited(true)
    }, [storeId])

    const handleStepClick = (stepId: string) => {
        if (stepId === 'products') {
            setProductsVisited(true)
            localStorage.setItem(`onboarding_products_visited_${storeId}`, 'true')
        }
        if (!hasProducts && stepId !== 'products') return
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
            completed: hasProducts || productsVisited,
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
        <div className="max-w-4xl mx-auto py-2">
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

            <div className="pb-4 text-center space-y-2">
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

                            <div className="p-4 lg:p-5 flex flex-col sm:flex-row items-center gap-4 lg:gap-6 relative">
                                {/* Step indicator badge - Absolute positioned to save vertical space */}
                                <div className={cn(
                                    "absolute top-0 right-0 h-7 px-3 flex items-center justify-center rounded-bl-xl text-[9px] font-black uppercase tracking-widest transition-colors",
                                    isActive ? "bg-orange/10 text-orange" : "bg-slate-100 text-slate-400"
                                )}>
                                    {isActive ? t('nextStep') : `${t('step')} ${index + 1}`}
                                </div>

                                <div className={cn(
                                    "flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-2xl transition-all duration-500 shrink-0 shadow-sm border border-white/20 backdrop-blur-sm",
                                    step.bgColor,
                                    step.color,
                                    isActive && "ring-4 ring-orange/10 scale-105"
                                )}>
                                    <step.icon className={cn("h-6 w-6 lg:h-7 lg:w-7")} />
                                </div>

                                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                                    <CardTitle className="text-sm lg:text-lg font-black text-navy leading-none tracking-tight">
                                        {step.title}
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 font-medium leading-normal lg:max-w-md">
                                        {step.description}
                                    </p>
                                </div>

                                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                    <Button
                                        asChild
                                        disabled={step.completed}
                                        data-testid={`onboarding-step-button-${step.id}`}
                                        variant={step.completed ? "ghost" : isActive ? "default" : "secondary"}
                                        className={cn(
                                            "h-10 lg:h-11 w-full sm:w-auto px-6 lg:px-8 text-xs lg:text-sm font-bold transition-all active:scale-95 group rounded-xl border-none",
                                            isActive
                                                ? "bg-orange hover:bg-orange-dark text-white shadow-lg shadow-orange/20"
                                                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                        )}
                                    >
                                        <Link href={step.href} onClick={() => handleStepClick(step.id)}>
                                            <span>{step.buttonText}</span>
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <div className="mt-8 bg-slate-50/80 p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange/5 rounded-full blur-2xl group-hover:bg-orange/10 transition-colors" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange">Tu Ruta al Éxito</h3>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500">Completa los pasos para desbloquear todo el potencial de tu negocio</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-orange/10 shadow-sm flex items-center justify-center gap-3 min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Progreso Total</span>
                        <span className="text-xl font-black text-orange tabular-nums">{Math.round(progress)}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                    {/* Connecting lines for desktop */}
                    <div className="hidden sm:block absolute top-6 left-8 right-8 h-[2px] bg-slate-200 -z-0" />

                    {[
                        { label: 'Catálogo', active: hasProducts, icon: Barcode, detail: 'Base de datos' },
                        { label: 'Inventario', active: steps[1].completed, icon: TrendingDown, detail: 'Control total' },
                        { label: 'Punto de Venta', active: steps[2].completed, icon: Zap, detail: 'Listo para vender' },
                        { label: 'Métricas AI', active: steps[2].completed, icon: LineChart, detail: 'Análisis de datos' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="relative flex sm:flex-col items-center gap-4 sm:gap-3 z-10 group/item"
                        >
                            <div className={cn(
                                "h-11 w-11 lg:h-12 lg:w-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border-4 border-slate-50",
                                item.active
                                    ? "bg-orange text-white shadow-lg shadow-orange/20 scale-110"
                                    : "bg-white text-slate-300 border-slate-100"
                            )}>
                                <item.icon className={cn(
                                    "h-5 w-5 lg:h-6 lg:w-6 transition-transform",
                                    item.active && "group-hover/item:scale-110"
                                )} />
                            </div>
                            <div className="text-left sm:text-center">
                                <span className={cn(
                                    "block text-xs font-black tracking-tight transition-colors",
                                    item.active ? "text-navy" : "text-slate-400"
                                )}>
                                    {item.label}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider transition-opacity",
                                    item.active ? "text-orange opacity-100" : "text-slate-300"
                                )}>
                                    {item.detail}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 relative pt-1 px-1">
                    <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange to-orange-dark transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute top-0 right-0 h-full w-8 bg-white/20 skew-x-[-20deg] animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
