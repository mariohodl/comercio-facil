'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Clock, AlertTriangle, Zap, ShieldCheck } from 'lucide-react'

export function MetricsSection() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const metrics = [
        {
            icon: TrendingUp,
            value: '3x',
            label: 'Crecimiento de Utilidad',
            description: 'Nuestros clientes triplican su margen operativo neto.',
            color: 'text-emerald-400',
            gradient: 'from-emerald-400 to-emerald-600',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/20'
        },
        {
            icon: Clock,
            value: '15h',
            label: 'Tiempo Recuperado',
            description: 'Semanales libres de tareas administrativas manuales.',
            color: 'text-blue-400',
            gradient: 'from-blue-400 to-blue-600',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/20'
        },
        {
            icon: AlertTriangle,
            value: '-40%',
            label: 'Reducción de Gastos',
            description: 'Elimine fugas de capital y pérdidas por merma de stock.',
            color: 'text-orange-400',
            gradient: 'from-orange-400 to-orange-600',
            bg: 'bg-orange-400/10',
            border: 'border-orange-400/20'
        },
        {
            icon: Zap,
            value: '+50%',
            label: 'Eficiencia en Ventas',
            description: 'Reduzca filas y atienda más clientes en menos tiempo.',
            color: 'text-purple-400',
            gradient: 'from-purple-400 to-purple-600',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/20'
        },
    ]

    return (
        <section className='relative py-24 pb-12 bg-slate-950 overflow-hidden'>
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none"></div>

            <div className='container mx-auto px-4 relative z-10'>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <h2 className='text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight'>
                        Resultados Reales en <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Cada Área de su Negocio</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        No somos solo una herramienta, somos el aliado que optimiza su operación y maximiza su rentabilidad cada día.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className={`group relative p-8 rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all duration-500 hover:-translate-y-1 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl ${metric.bg} border ${metric.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <metric.icon className={`w-6 h-6 ${metric.color}`} strokeWidth={2} />
                                </div>

                                {/* Value */}
                                <div className={`text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight`}>
                                    {metric.value}
                                </div>

                                {/* Label */}
                                <div className={`font-semibold text-lg ${metric.color} mb-2`}>
                                    {metric.label}
                                </div>

                                {/* Description */}
                                <div className="text-slate-500 text-sm font-medium">
                                    {metric.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Trust Indicators */}
                <div className="mt-20 pt-10 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 md:gap-16">
                    <div className="flex items-center gap-3 group">
                        <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-500 group-hover:text-emerald-400 transition-colors">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">Modo Offline</span>
                            <span className="text-slate-500 text-xs">Siga vendiendo sin internet</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-blue-500 group-hover:text-blue-400 transition-colors">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">Sin Contratos</span>
                            <span className="text-slate-500 text-xs">Cancele cuando quiera</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-purple-500 group-hover:text-purple-400 transition-colors">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">Soporte Local</span>
                            <span className="text-slate-500 text-xs">Atención humana 24/7</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
