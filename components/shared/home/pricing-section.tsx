'use client'

import { useState } from 'react'
import { Check, Zap, Shield, Crown, Globe, WifiOff, Printer, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true)

    const plans = [
        {
            name: 'Plan Básico',
            monthlyPrice: '280',
            yearlyPrice: '200',
            badge: '✨ No requiere tarjeta de crédito',
            description: 'Todo lo esencial para digitalizar tu negocio hoy mismo.',
            features: [
                'Primer mes totalmente GRATIS',
                'Gestión de Inventario avanzada',
                'Punto de Venta (POS) completo',
                'Reportes de ventas básicos',
                'Soporte por correo electrónico',
                'Acceso desde cualquier dispositivo'
            ],
            icon: Shield,
            color: 'blue',
            buttonVariant: 'outline' as const,
        },
        {
            name: 'Plan Intermedio',
            monthlyPrice: '200',
            yearlyPrice: '100',
            discount: '50',
            description: 'Potencia tu punto de venta con integración de hardware.',
            features: [
                'Todo lo incluido en el Plan Básico',
                'MODO OFFLINE (Vende sin internet)',
                'Conexión con Escáner de códigos',
                'Gestión de múltiples terminales',
                'Analítica detallada de inventario',
                'Soporte técnico prioritario'
            ],
            icon: Zap,
            color: 'orange',
            buttonVariant: 'default' as const,
            popular: true,
        },
        {
            name: 'Plan Avanzado',
            monthlyPrice: '500',
            yearlyPrice: '350',
            discount: '30',
            description: 'Máxima disponibilidad. Tu negocio nunca se detiene.',
            features: [
                'Todo lo incluido en el Plan Intermedio',
                'Sincronización automática a la nube',
                'Módulo de Facturación Electrónica',
                'App móvil para dueños (Real-time)',
                'Soporte 24/7 dedicado'
            ],
            icon: Crown,
            color: 'navy',
            buttonVariant: 'outline' as const,
        }
    ]

    return (
        <section id="pricing" className='relative py-16 bg-white overflow-hidden'>
            <div className='container mx-auto px-4'>
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-100 mb-2 animate-fade-in">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-wider uppercase">Mejor Valor para tu Negocio</span>
                    </div>
                    <h2 className='text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight'>
                        Precios que se <span className="text-orange-500">adaptan</span> a ti
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Control total de tu inversión. Selecciona el ciclo de facturación que mejor te funcione.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-10 gap-4">
                        <span className={cn("text-sm font-semibold transition-colors", !isAnnual ? "text-slate-900" : "text-slate-400")}>
                            Mensual
                        </span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative w-16 h-8 rounded-full bg-slate-200 border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            <div className={cn(
                                "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300",
                                isAnnual ? "translate-x-8 bg-orange-500" : "translate-x-0"
                            )}></div>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-semibold transition-colors", isAnnual ? "text-slate-900" : "text-slate-400")}>
                                Anual
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-tight">
                                Ahorra hasta 50%
                            </span>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto'>
                    {plans.map((plan, index) => {
                        const currentPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
                        const originalPrice = isAnnual ? plan.monthlyPrice : null;
                        const hasDiscount = isAnnual && plan.discount;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "relative flex flex-col px-8 py-6 rounded-[2.5rem] bg-white border transition-all duration-500 hover:shadow-2xl group",
                                    plan.popular
                                        ? "border-orange-500/50 shadow-xl shadow-orange-500/10 scale-105 z-10 bg-gradient-to-b from-white to-orange-50/30"
                                        : "border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                                        <Zap className="w-3 h-3 fill-current" />
                                        Más Popular
                                    </div>
                                )}

                                <div className="mb-4 text-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-transform group-hover:scale-110 duration-500 shadow-sm",
                                        plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                            plan.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                'bg-slate-900 text-white'
                                    )}>
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className='text-xl font-bold text-slate-900 mb-1'>{plan.name}</h3>
                                    <p className='text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto'>{plan.description}</p>
                                </div>

                                <div className="mb-6 flex flex-col items-center">
                                    <div className="flex items-baseline gap-2 justify-center">
                                        {originalPrice && (
                                            <span className='text-base font-bold text-slate-300 line-through'>
                                                ${originalPrice}
                                            </span>
                                        )}
                                        <div className="flex items-baseline gap-1">
                                            <span className='text-4xl font-black text-slate-900 tracking-tighter'>
                                                ${currentPrice}
                                            </span>
                                            <span className='text-slate-500 text-xs font-medium'>/ mes</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-col items-center gap-1">
                                        {isAnnual ? (
                                            <>
                                                {plan.badge ? (
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                        {plan.badge}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                        Facturado anualmente (${Number(currentPrice) * 12}/año)
                                                    </span>
                                                )}
                                                {hasDiscount && (
                                                    <span className="text-orange-600 text-[9px] font-bold uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                                        {plan.discount}% de ahorro incluido
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-[10px] font-medium text-slate-400">
                                                Facturado mes a mes
                                            </span>
                                        )}

                                        {plan.name === 'Plan Básico' && !isAnnual && (
                                            <span className="text-emerald-600 text-[9px] font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1">
                                                1er Mes Gratis
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {plan.name === 'Plan Intermedio' && (
                                    <div className="mb-6 p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors text-center">
                                        <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                                            <span className="font-bold text-slate-700">Hardware:</span> $630.00 pago único opcional.
                                        </span>
                                    </div>
                                )}

                                <ul className='space-y-2.5 mb-8 flex-grow mx-auto w-fit'>
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2.5 group/item">
                                            <div className={cn(
                                                "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-sm",
                                                plan.popular ? 'bg-orange-500' : 'bg-slate-900 group-hover/item:bg-orange-500'
                                            )}>
                                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                                            </div>
                                            <span className={cn(
                                                "text-xs transition-colors",
                                                feature.includes('GRATIS') || feature.includes('OFFLINE')
                                                    ? 'text-slate-900 font-bold'
                                                    : 'text-slate-600'
                                            )}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={plan.buttonVariant}
                                    className={cn(
                                        "w-full h-12 rounded-xl text-base font-bold transition-all duration-300",
                                        plan.popular
                                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                                            : "hover:bg-slate-900 hover:text-white border-slate-200"
                                    )}
                                >
                                    {plan.name === 'Plan Básico' ? 'Iniciar Gratis' : `Elegir ${plan.name.split(' ')[1]}`}
                                </Button>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex flex-wrap justify-center items-center gap-8 py-8 px-12 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Printer className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">Hardware Compatible</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Globe className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">Actualizaciones Gratis</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <WifiOff className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">Sync Offline Inteligente</span>
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
