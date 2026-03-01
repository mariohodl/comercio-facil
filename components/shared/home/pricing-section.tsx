'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Zap, Shield, Crown, Globe, WifiOff, Printer, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true)

    const plans = [
        {
            name: 'Plan Básico',
            subTitle: 'Para la tienda que atiende su dueño',
            monthlyPrice: '149',
            yearlyPrice: '100',
            annualTotal: '1,200',
            dailyPrice: '3.4',
            dailyMessage: 'Menos que un refresco',
            discount: '32',
            description: 'Gestión esencial para el pequeño comercio.',
            features: [
                'POS rápido',
                'Control de inventario básico',
                'Reportes sencillos',
                'Sin modo OFFLINE',
                'Sin múltiples empleados'
            ],
            icon: Shield,
            color: 'blue',
            buttonVariant: 'outline' as const,
        },
        {
            name: 'Plan Intermedio',
            subTitle: 'Para negocios con empleados y ventas offline',
            monthlyPrice: '300',
            yearlyPrice: '195',
            annualTotal: '2,300',
            dailyPrice: '6.4',
            dailyMessage: 'Como un café a la semana',
            discount: '35',
            description: 'Potencia tu punto de venta con modo offline.',
            features: [
                'TODO lo del Básico',
                'MODO OFFLINE (vende sin internet)',
                'Sesiones de caja (control de empleados)',
                'Escáner de códigos',
                'Reportes por empleado'
            ],
            icon: Zap,
            color: 'orange',
            buttonVariant: 'default' as const,
            popular: true,
        },
        {
            name: 'Plan Avanzado',
            subTitle: 'Para dueños con múltiples tiendas',
            monthlyPrice: '550',
            yearlyPrice: '349',
            annualTotal: '4,200',
            dailyPrice: '11.6',
            dailyMessage: 'Lo que pierdes en un producto caducado',
            discount: '36',
            description: 'Máxima disponibilidad y gestión multi-sucursal.',
            features: [
                'TODO del Intermedio',
                'Múltiples sucursales',
                'Facturación electrónica (CFDI)',
                'App dueño en tiempo real',
                'Respaldos automáticos',
                'Soporte 24/7'
            ],
            icon: Crown,
            color: 'navy',
            buttonVariant: 'outline' as const,
        }
    ]

    return (
        <section id="pricing" className='relative py-16 bg-white overflow-hidden'>
            <div className='container mx-auto px-4'>
                <div className="mb-12 max-w-2xl mx-auto space-y-10">
                    {/* Launch Promo Banner */}
                    <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group border border-orange-400">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tight flex items-center gap-2 justify-center md:justify-start">
                                    <span className="text-3xl">🎁</span> BENEFICIO EXCLUSIVO
                                </h3>
                                <p className="text-orange-50 font-medium">Contrata anual <Link href="/sign-in?promo=PROMO2M" className="text-white font-black underline decoration-2 underline-offset-4 hover:text-orange-100 hover:scale-110 inline-block transition-all transition-transform">HOY</Link> y recibe 2 meses adicionales sin costo</p>
                            </div>
                            <div className="flex flex-col items-center md:items-end">
                                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                                    Cupos Limitados: 100
                                </span>
                                <span className="text-[10px] text-orange-200 mt-2 italic font-black">¡Asegura tu lugar!</span>
                            </div>
                        </div>
                        {/* Decorative elements for promo */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                    </div>

                    {/* Unified Billing Toggle - Segmented Control Style */}
                    <div className="flex justify-center">
                        <div className="relative grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/40 shadow-inner w-full max-w-[340px]">
                            {/* Sliding Background Pill */}
                            <div
                                className={cn(
                                    "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) bg-white rounded-[14px] shadow-sm shadow-slate-200/50 border border-slate-200/30",
                                    isAnnual ? "translate-x-[calc(100%+6px)]" : "translate-x-0"
                                )}
                            />

                            <button
                                onClick={() => setIsAnnual(false)}
                                className={cn(
                                    "relative z-10 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                                    !isAnnual ? "text-slate-900" : "text-slate-400 hover:text-slate-500"
                                )}
                            >
                                Mes a Mes
                            </button>

                            <button
                                onClick={() => setIsAnnual(true)}
                                className={cn(
                                    "relative z-10 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-1.5",
                                    isAnnual ? "text-slate-900" : "text-slate-400 hover:text-slate-500"
                                )}
                            >
                                Anual
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase shadow-sm transition-all duration-500",
                                    isAnnual ? "bg-emerald-500 text-white scale-110" : "bg-emerald-100 text-emerald-600"
                                )}>
                                    -30%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto'>
                    {plans.map((plan, index) => {
                        const currentPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
                        const originalPrice = isAnnual ? plan.monthlyPrice : null;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "relative flex flex-col px-8 py-10 rounded-[2.5rem] bg-white border transition-all duration-500 hover:shadow-2xl group",
                                    plan.popular
                                        ? "border-orange-500/50 shadow-xl shadow-orange-500/10 scale-105 z-10 bg-gradient-to-b from-white to-orange-50/30"
                                        : "border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                                        <Zap className="w-3 h-3 fill-current" />
                                        RECOMENDADO
                                    </div>
                                )}

                                <div className="mb-6 text-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-transform group-hover:scale-110 duration-500 shadow-sm",
                                        plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                            plan.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                'bg-slate-900 text-white'
                                    )}>
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className='text-2xl font-bold text-slate-900 mb-1 tracking-tight'>{plan.name}</h3>
                                    <p className='text-orange-500 text-[11px] font-bold uppercase tracking-widest'>{plan.subTitle}</p>
                                </div>

                                <div className="mb-10 flex flex-col items-center">
                                    <div className="h-28 flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-baseline gap-2">
                                            {originalPrice && (
                                                <span className='text-sm font-bold text-slate-400 line-through'>
                                                    ${originalPrice}
                                                </span>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className='text-5xl font-black text-slate-900 tracking-tighter'>
                                                    ${currentPrice}
                                                </span>
                                                <span className='text-slate-500 text-xs font-bold uppercase tracking-widest'>/ mes</span>
                                            </div>
                                        </div>

                                        {/* Daily Cost Badge - Fixed height for alignment */}
                                        <div className="min-h-[52px] w-full mt-4 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-0.5 group-hover:bg-white transition-all duration-500 shadow-sm group-hover:shadow-md">
                                            <span className="text-orange-600 font-black text-xs uppercase tracking-widest">${plan.dailyPrice} pesos / día</span>
                                            <span className="text-[13px] text-slate-500 font-bold italic">"{plan.dailyMessage}"</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col items-center gap-1.5 h-10">
                                        {isAnnual ? (
                                            <>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                                                    Facturado anual: ${plan.annualTotal}/año
                                                </span>
                                                <span className="text-orange-600 text-[8px] font-black uppercase bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                                                    {plan.discount}% de ahorro incluido
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                                Sin compromiso anual
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className='space-y-3.5 mb-8 flex-grow'>
                                    {plan.features.map((feature, fIndex) => {
                                        const isExcluded = feature.startsWith('Sin');
                                        return (
                                            <li key={fIndex} className="flex items-start gap-3 group/item">
                                                <div className={cn(
                                                    "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-sm",
                                                    isExcluded ? 'bg-slate-100' : (plan.popular ? 'bg-orange-500' : 'bg-slate-900 group-hover/item:bg-orange-500')
                                                )}>
                                                    {isExcluded ? (
                                                        <X className="w-2.5 h-2.5 text-slate-400" strokeWidth={4} />
                                                    ) : (
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-sm transition-colors",
                                                    isExcluded
                                                        ? 'text-slate-400'
                                                        : (feature.includes('TODO') || feature.includes('OFFLINE')
                                                            ? 'text-slate-900 font-bold'
                                                            : 'text-slate-600')
                                                )}>
                                                    {feature}
                                                </span>
                                            </li>
                                        )
                                    })}
                                </ul>

                                <Button
                                    variant={plan.buttonVariant}
                                    className={cn(
                                        "w-full h-12 rounded-xl text-sm font-bold transition-all duration-300",
                                        plan.popular
                                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                                            : "hover:bg-slate-900 hover:text-white border-slate-200"
                                    )}
                                >
                                    Elegir {plan.name.split(' ')[1]}
                                </Button>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex flex-wrap justify-center items-center gap-8 py-8 px-12 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Printer className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hardware Compatible</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Globe className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Actualizaciones Gratis</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <WifiOff className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sync Offline</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl -z-10 opacity-60"></div>
            <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-40"></div>
            <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl -z-10 opacity-30"></div>
        </section>
    )
}
