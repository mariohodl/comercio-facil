import { BarChart2, Zap, Smartphone } from 'lucide-react'

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
            title: 'Control de Stock Inteligente',
            description: 'Visibilidad total de su inventario en cada almacén. Evite pérdidas, detecte mermas y reciba alertas automáticas cuando necesite resurtir sus productos.',
            iconColor: 'text-emerald-600',
            bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
            iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
            hoverShadow: 'shadow-emerald-500/20',
            ctaText: 'Ver Almacenes',
            ctaLink: '#inventory'
        },
        {
            icon: Zap,
            illustration: SpeedIllustration,
            title: 'Punto de Venta (POS) Ágil',
            description: 'Cobre en segundos y siga vendiendo incluso si falla el internet. Nuestra tecnología offline asegura que su caja nunca se detenga y sincronice al volver la red.',
            iconColor: 'text-orange-600',
            bgGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
            iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
            hoverShadow: 'shadow-orange-500/20',
            ctaText: 'Probar Punto de Venta',
            ctaLink: '#pos'
        },
        {
            icon: Smartphone,
            illustration: ControlIllustration,
            title: 'Gestión Cloud Multi-Box',
            description: 'Controle múltiples sucursales desde su celular. Supervise ventas, autorice descuentos y consulte reportes de rentabilidad desde cualquier lugar del mundo.',
            iconColor: 'text-blue-600',
            bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
            iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
            hoverShadow: 'shadow-blue-500/20',
            ctaText: 'Ver Reportes Clave',
            ctaLink: '#mobile'
        },
    ]

    return (
        <section id="features" className='relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden'>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className='container mx-auto px-4'>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-6 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1976D2]/10 backdrop-blur-sm border border-[#1976D2]/20 mb-4 hover:bg-[#1976D2]/20 transition-colors cursor-default">
                        <div className="w-2 h-2 bg-[#1976D2] rounded-full animate-ping"></div>
                        <span className="text-sm font-semibold text-[#1976D2]">Todo bajo su control</span>
                    </div>
                    <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight'>
                        Domine su Operación <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1976D2] via-blue-600 to-[#0D47A1]">desde la Primera Venta</span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-medium">
                        Olvídese del inventario manual. Centralice su control de stock, gestione su punto de venta y supervise todas sus sucursales en tiempo real.
                    </p>
                </div>

                {/* Features Grid */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='group relative'
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Card with 3D hover effect setup */}
                            <div className={`relative h-full p-8 md:p-10 rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl ${feature.hoverShadow} transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col`}>

                                {/* Animated gradient background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Illustration Area */}
                                    <div className="relative mb-8 group-hover:scale-105 transition-transform duration-700 ease-out">
                                        <div className={`absolute -inset-4 bg-gradient-to-br ${feature.bgGradient} rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700`}></div>
                                        <feature.illustration />
                                    </div>

                                    {/* Icon & Title */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${feature.iconBg} shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/60`}>
                                            <feature.icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={2.5} />
                                        </div>
                                        <h3 className='text-2xl font-bold text-gray-900 group-hover:text-[#1976D2] transition-colors duration-300 mt-2'>
                                            {feature.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className='text-gray-600 leading-relaxed text-lg flex-grow mb-8'>
                                        {feature.description}
                                    </p>

                                    {/* CTA Link */}
                                    <a href={feature.ctaLink} className="inline-flex items-center gap-2 text-[#1976D2] font-bold group/link hover:gap-3 transition-all duration-300 mt-auto">
                                        <span>{feature.ctaText}</span>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover/link:bg-[#1976D2] group-hover/link:text-white transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
