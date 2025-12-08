import { Package, Monitor, PieChart, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function TechnicalModulesSection() {
    const modules = [
        {
            title: 'Gestión de Inventario',
            subtitle: 'Visibilidad 360° de su Stock',
            description: 'Transforme su inventario de un costo a un activo estratégico. Soporte para múltiples almacenes, lotes y números de serie con alertas dinámicas.',
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            bgGradient: 'from-blue-50/80 to-blue-100/60',
            accentColor: 'bg-blue-500',
            borderColor: 'border-blue-200',
            features: ['Multi-almacén', 'Alertas en tiempo real', 'Trazabilidad completa']
        },
        {
            title: 'Punto de Venta (POS)',
            subtitle: 'Experiencia de Compra Superior',
            description: 'Eficiencia en entornos de alto tráfico. Integración nativa con lectores de códigos de barras y sincronización instantánea con el inventario.',
            icon: Monitor,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            bgGradient: 'from-orange-50/80 to-orange-100/60',
            accentColor: 'bg-orange-500',
            borderColor: 'border-orange-200',
            features: ['Pagos rápidos', 'Lector de códigos', 'Offline mode']
        },
        {
            title: 'Business Intelligence',
            subtitle: 'Decisiones Basadas en Datos',
            description: 'Análisis exhaustivos de rentabilidad y productividad. Informes financieros exportables para una planeación fiscal eficiente.',
            icon: PieChart,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            bgGradient: 'from-emerald-50/80 to-emerald-100/60',
            accentColor: 'bg-emerald-500',
            borderColor: 'border-emerald-200',
            features: ['Reportes en tiempo real', 'Análisis predictivo', 'Exportación automática']
        },
    ]

    return (
        <section className='relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden'>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-40 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-0 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl"></div>
            </div>

            <div className='container mx-auto px-4'>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1976D2]/10 backdrop-blur-sm border border-[#1976D2]/20 mb-6">
                        <div className="w-2 h-2 bg-[#1976D2] rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-[#1976D2]">MÓDULOS TÉCNICOS</span>
                    </div>
                    <h2 className='text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4'>
                        Tecnología que <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1976D2] to-[#0D47A1]">Impulsa su Negocio</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600">
                        Soluciones integradas diseñadas para operaciones modernas y eficientes
                    </p>
                </div>

                {/* Modules */}
                <div className='space-y-32'>
                    {modules.map((module, index) => (
                        <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Text Content */}
                            <div className='flex-1 space-y-6 lg:space-y-8'>
                                {/* Badge */}
                                <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border-2 ${module.borderColor} ${module.bg} backdrop-blur-sm shadow-sm`}>
                                    <div className={`w-8 h-8 rounded-lg ${module.bg} flex items-center justify-center shadow-sm`}>
                                        <module.icon className={`w-4 h-4 ${module.color}`} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-sm font-bold ${module.color} uppercase tracking-wide`}>
                                        {module.title}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className='text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight'>
                                    {module.subtitle}
                                </h3>

                                {/* Description */}
                                <p className='text-lg md:text-xl text-gray-600 leading-relaxed'>
                                    {module.description}
                                </p>

                                {/* Features List */}
                                <ul className="space-y-3">
                                    {module.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700">
                                            <div className={`w-6 h-6 rounded-full ${module.bg} flex items-center justify-center flex-shrink-0`}>
                                                <CheckCircle className={`w-4 h-4 ${module.color}`} strokeWidth={2.5} />
                                            </div>
                                            <span className="font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link
                                    href="/admin"
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${module.bg} ${module.color} font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-2 ${module.borderColor} group`}
                                >
                                    Explorar Módulo
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                                </Link>
                            </div>

                            {/* Visual Content */}
                            <div className='flex-1 w-full'>
                                <div className="relative group">
                                    {/* Main Card */}
                                    <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${module.bgGradient} border border-gray-200/50 transform transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-3xl`}>
                                        {/* Decorative elements */}
                                        <div className={`absolute top-0 right-0 w-40 h-40 ${module.accentColor}/10 rounded-full blur-3xl`}></div>
                                        <div className={`absolute bottom-0 left-0 w-32 h-32 ${module.accentColor}/10 rounded-full blur-2xl`}></div>

                                        <div className="absolute inset-0 flex items-center justify-center p-8">
                                            {/* UI Mockup */}
                                            <div className="w-full h-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 transform transition-transform duration-700 group-hover:scale-105 border border-gray-100">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl ${module.bg} flex items-center justify-center shadow-md`}>
                                                            <module.icon className={`w-6 h-6 ${module.color}`} strokeWidth={2.5} />
                                                        </div>
                                                        <div>
                                                            <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
                                                            <div className="h-2 w-16 bg-gray-100 rounded-full mt-2"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-8 h-8 bg-gray-50 rounded-lg"></div>
                                                        <div className="w-8 h-8 bg-gray-50 rounded-lg"></div>
                                                    </div>
                                                </div>

                                                {/* Content Placeholder */}
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className={`h-24 rounded-xl bg-gradient-to-br ${module.bgGradient} border ${module.borderColor} p-4`}>
                                                            <div className="h-2 w-12 bg-white/80 rounded-full mb-2"></div>
                                                            <div className="h-4 w-16 bg-white/90 rounded-full"></div>
                                                        </div>
                                                        <div className={`h-24 rounded-xl bg-gradient-to-br ${module.bgGradient} border ${module.borderColor} p-4`}>
                                                            <div className="h-2 w-12 bg-white/80 rounded-full mb-2"></div>
                                                            <div className="h-4 w-16 bg-white/90 rounded-full"></div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="h-3 w-full bg-gray-100 rounded-full"></div>
                                                        <div className="h-3 w-5/6 bg-gray-100 rounded-full"></div>
                                                        <div className="h-3 w-4/6 bg-gray-100 rounded-full"></div>
                                                    </div>

                                                    <div className={`h-32 rounded-xl bg-gradient-to-br ${module.bgGradient} border ${module.borderColor}`}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating badge */}
                                        <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-2xl ${module.accentColor} flex items-center justify-center shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
                                            <module.icon className="w-10 h-10 text-white" strokeWidth={2} />
                                        </div>
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
