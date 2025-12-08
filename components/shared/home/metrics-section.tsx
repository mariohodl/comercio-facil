'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, Package, ShoppingCart } from 'lucide-react'

export function MetricsSection() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const metrics = [
        {
            icon: TrendingUp,
            value: '250%',
            label: 'Incremento en Ventas',
            description: 'Promedio anual',
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            icon: Users,
            value: '10,000+',
            label: 'Clientes Activos',
            description: 'Y contando',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            icon: Package,
            value: '99.9%',
            label: 'Precisión de Inventario',
            description: 'Control total',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            icon: ShoppingCart,
            value: '5M+',
            label: 'Transacciones',
            description: 'Procesadas mensualmente',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
    ]

    return (
        <section className='relative py-20 md:py-24 bg-gradient-to-br from-[#1976D2] via-[#1565C0] to-[#0D47A1] overflow-hidden'>
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

            <div className='container mx-auto px-4 relative z-10'>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className='text-3xl md:text-5xl font-extrabold text-white tracking-tight'>
                        Resultados que <span className="text-[#FF9800]">Hablan por Sí Mismos</span>
                    </h2>
                    <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                        Miles de empresas confían en nosotros para transformar su operación
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className={`group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'
                                }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Glow effect */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${metric.color} rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}></div>

                            <div className="relative">
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl ${metric.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <metric.icon className={`w-7 h-7 ${metric.iconColor}`} strokeWidth={2.5} />
                                </div>

                                {/* Value */}
                                <div className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${metric.color} mb-2`}>
                                    {metric.value}
                                </div>

                                {/* Label */}
                                <div className="text-white font-bold text-lg mb-1">
                                    {metric.label}
                                </div>

                                {/* Description */}
                                <div className="text-blue-200 text-sm">
                                    {metric.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom decoration */}
                <div className="mt-16 flex justify-center items-center gap-8 flex-wrap">
                    <div className="flex items-center gap-3 text-white/80">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="font-medium">Certificado ISO 27001</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="font-medium">99.9% Uptime Garantizado</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-medium">Soporte 24/7</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
