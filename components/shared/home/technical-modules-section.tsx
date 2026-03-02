import { Package, Monitor, PieChart, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function TechnicalModulesSection() {
    const modules = [
        {
            title: 'Gestión de Inventario',
            subtitle: 'Visibilidad 360° de su Stock',
            description: 'Transforme su inventario de un costo a un activo estratégico. Soporte para múltiples almacenes, lotes y números de serie con alertas dinámicas.',
            image: '/images/inventory-mockup.png',
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
            image: '/images/pos-mockup.png',
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
            image: '/images/analytics-mockup.png',
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
                        <span className="text-sm font-semibold text-[#1976D2]">¿POR QUÉ ELEGIR COMERCIO FÁCIL?</span>
                    </div>
                    <h2 className='text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4'>
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
                                    {/* Decoration behind the image */}
                                    <div className={`absolute -inset-4 bg-gradient-to-br ${module.bgGradient} rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                    {/* Image Container */}
                                    <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 transform transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-3xl bg-white`}>
                                        <img
                                            src={module.image}
                                            alt={module.title}
                                            className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
                                    </div>

                                    {/* Floating icon badge */}
                                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-3xl ${module.accentColor} flex items-center justify-center shadow-2xl transform rotate-12 group-hover:rotate-0 transition-all duration-500 z-10`}>
                                        <module.icon className="w-12 h-12 text-white" strokeWidth={2} />
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
