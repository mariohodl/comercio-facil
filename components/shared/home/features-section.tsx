import { BarChart2, Zap, ShieldCheck } from 'lucide-react'

// SVG Illustrations
const DataIllustration = () => (
    <svg className="w-full h-48 mb-6" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="30" height="100" rx="4" fill="#10B981" opacity="0.2" />
        <rect x="60" y="60" width="30" height="80" rx="4" fill="#10B981" opacity="0.3" />
        <rect x="100" y="20" width="30" height="120" rx="4" fill="#10B981" opacity="0.4" />
        <rect x="140" y="50" width="30" height="90" rx="4" fill="#10B981" opacity="0.5" />
        <path d="M30 120L60 100L100 40L140 70" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="120" r="5" fill="#10B981" />
        <circle cx="60" cy="100" r="5" fill="#10B981" />
        <circle cx="100" cy="40" r="5" fill="#10B981" />
        <circle cx="140" cy="70" r="5" fill="#10B981" />
    </svg>
)

const SpeedIllustration = () => (
    <svg className="w-full h-48 mb-6" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="40" width="120" height="80" rx="12" fill="#FF9800" opacity="0.1" stroke="#FF9800" strokeWidth="2" />
        <rect x="50" y="50" width="100" height="60" rx="8" fill="white" stroke="#FF9800" strokeWidth="2" />
        <path d="M110 80L120 90L130 70" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M160 60L180 80L160 100" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M170 60L190 80L170 100" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
)

const ControlIllustration = () => (
    <svg className="w-full h-48 mb-6" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="30" width="100" height="100" rx="8" fill="#1976D2" opacity="0.1" stroke="#1976D2" strokeWidth="2" />
        <rect x="60" y="50" width="35" height="35" rx="4" fill="white" stroke="#1976D2" strokeWidth="2" />
        <rect x="105" y="50" width="35" height="35" rx="4" fill="white" stroke="#1976D2" strokeWidth="2" />
        <rect x="60" y="95" width="35" height="35" rx="4" fill="white" stroke="#1976D2" strokeWidth="2" />
        <rect x="105" y="95" width="35" height="35" rx="4" fill="white" stroke="#1976D2" strokeWidth="2" />
        <circle cx="100" cy="80" r="35" fill="#1976D2" opacity="0.1" />
        <path d="M85 80L95 90L115 70" stroke="#1976D2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export function FeaturesSection() {
    const features = [
        {
            icon: BarChart2,
            illustration: DataIllustration,
            title: 'Datos Centralizados',
            description: 'Acceda a métricas unificadas y dashboards personalizados. Base sus estrategias de compra y venta en análisis predictivos.',
            iconColor: 'text-emerald-600',
            bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
            iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
            hoverShadow: 'shadow-emerald-500/20',
        },
        {
            icon: Zap,
            illustration: SpeedIllustration,
            title: 'Agilidad Transaccional',
            description: 'POS móvil diseñado para la rapidez. Procese pagos y gestione devoluciones de forma fluida, minimizando el tiempo de espera.',
            iconColor: 'text-orange-600',
            bgGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
            iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
            hoverShadow: 'shadow-orange-500/20',
        },
        {
            icon: ShieldCheck,
            illustration: ControlIllustration,
            title: 'Control Total',
            description: 'Trazabilidad completa de cada SKU. Del ingreso a la venta, conozca el historial de movimientos y minimice pérdidas.',
            iconColor: 'text-blue-600',
            bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
            iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
            hoverShadow: 'shadow-blue-500/20',
        },
    ]

    return (
        <section id="features" className='relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden'>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className='container mx-auto px-4'>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1976D2]/10 backdrop-blur-sm border border-[#1976D2]/20 mb-4">
                        <div className="w-2 h-2 bg-[#1976D2] rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-[#1976D2]">Características Principales</span>
                    </div>
                    <h2 className='text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight'>
                        Optimice Procesos, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1976D2] to-[#0D47A1]">Multiplique Resultados</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Herramientas diseñadas para potenciar cada aspecto de su operación minorista.
                    </p>
                </div>

                {/* Features Grid */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='group relative'
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Card */}
                            <div className={`relative h-full p-8 md:p-10 rounded-3xl bg-white border border-gray-200/80 shadow-lg hover:shadow-2xl ${feature.hoverShadow} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                                {/* Animated gradient background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                {/* Decorative element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-gray-50 rounded-bl-full opacity-50"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Illustration */}
                                    <div className="group-hover:scale-105 transition-transform duration-500">
                                        <feature.illustration />
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/50`}>
                                        <feature.icon className={`w-8 h-8 ${feature.iconColor}`} strokeWidth={2.5} />
                                    </div>

                                    {/* Content */}
                                    <h3 className='text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#1976D2] transition-colors duration-300'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-gray-600 leading-relaxed text-base flex-grow'>
                                        {feature.description}
                                    </p>

                                    {/* Hover indicator */}
                                    <div className="mt-6 flex items-center gap-2 text-[#1976D2] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                                        <span className="text-sm">Explorar más</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
