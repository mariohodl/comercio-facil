import { Check, Zap, Shield, Crown, Globe, WifiOff, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PricingSection() {
    const plans = [
        {
            name: 'Plan Básico',
            price: '200',
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
            originalPrice: '200',
            price: '100',
            discount: '50',
            description: 'Potencia tu punto de venta con integración de hardware.',
            features: [
                'Todo lo incluido en el Plan Básico',
                'MODO OFFLINE (Vende sin internet)',
                'Conexión con Escáner de códigos',
                // 'Integración con Impresoras de tickets',
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
            price: '350',
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
        <section id="pricing" className='relative py-24 bg-white overflow-hidden'>
            <div className='container mx-auto px-4'>
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-100 mb-4 animate-fade-in">
                        <span className="text-sm font-bold tracking-wider uppercase">Precios Transparentes</span>
                    </div>
                    <h2 className='text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight'>
                        Elige el plan ideal para <span className="text-orange-500">hacer crecer</span> tu negocio
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Precios simples, sin letras chiquitas. Todos nuestros planes están diseñados para escalar contigo.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto'>
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-8 rounded-[2.5rem] bg-white border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${plan.popular
                                ? 'border-orange-500 shadow-xl shadow-orange-500/10 scale-105 z-10'
                                : 'border-slate-100'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    plan.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                        'bg-navy text-white'
                                    }`}>
                                    <plan.icon className="w-8 h-8" />
                                </div>
                                <h3 className='text-2xl font-bold text-slate-900 mb-2'>{plan.name}</h3>
                                <p className='text-slate-500 text-sm leading-relaxed'>{plan.description}</p>
                            </div>

                            <div className="mb-8 flex flex-col gap-1">
                                <div className="flex items-center flex-wrap gap-2">
                                    {plan.originalPrice && (
                                        <span className='text-xl font-bold text-slate-400 line-through'>${plan.originalPrice}</span>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className='text-4xl font-black text-slate-900'>${plan.price}</span>
                                        <span className='text-slate-500 font-medium'>/ mes</span>
                                    </div>
                                    {plan.discount && (
                                        <span className="text-orange-600 text-[10px] font-bold uppercase bg-orange-50 px-2 py-1 rounded border border-orange-100">{plan.discount}% OFF</span>
                                    )}
                                    {plan.name === 'Plan Básico' && (
                                        <span className="text-emerald-600 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-100">1er Mes Gratis</span>
                                    )}
                                </div>
                                {plan.name === 'Plan Intermedio' && (
                                    <span className="text-[10px] text-slate-400 font-medium italic mt-1">
                                        * Costo de hardware: $630.00 (pago único opcional)
                                    </span>
                                )}
                            </div>

                            <ul className='space-y-4 mb-10 flex-grow'>
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3 group">
                                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-orange-500' : 'bg-slate-900'
                                            }`}>
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                        <span className={`text-sm ${feature.includes('GRATIS') || feature.includes('OFFLINE')
                                            ? 'text-slate-900 font-bold'
                                            : 'text-slate-600'
                                            }`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.buttonVariant}
                                className={`w-full h-14 rounded-2xl text-lg font-bold transition-all duration-300 ${plan.popular
                                    ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30'
                                    : 'hover:bg-slate-900 hover:text-white'
                                    }`}
                            >
                                Seleccionar {plan.name.split(' ')[1]}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex flex-wrap justify-center items-center gap-8 py-6 px-10 rounded-3xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <Printer className="w-6 h-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Hardware Compatible</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <Globe className="w-6 h-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Actualizaciones Siempre Gratis</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <WifiOff className="w-6 h-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Sync Offline Inteligente</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl -z-10 opacity-60"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        </section>
    )
}
