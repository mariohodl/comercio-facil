import { AlertTriangle, PackageX, ReceiptText, X } from 'lucide-react'

export function ProblemSection() {
    const problems = [
        {
            icon: PackageX,
            title: 'Pérdida de Stock',
            description: 'Nunca sepas qué tienes disponible y pierdas ventas por falta de inventario real.',
            gradient: 'from-rose-50 to-red-50',
            borderColor: 'border-red-100',
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100',
        },
        {
            icon: ReceiptText,
            title: 'Desorden en Caja',
            description: 'Cierres de caja que no cuadran y fugas de capital sin identificar.',
            gradient: 'from-orange-50 to-amber-50',
            borderColor: 'border-orange-100',
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-100',
        }
    ]

    return (
        <section className='relative py-20 bg-slate-50/50 overflow-hidden'>
            {/* Background Decorations */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-red-50/50 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-orange-50/50 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            </div>

            <div className='container mx-auto px-4'>
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className='text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight'>
                        ¿Cansado de la <span className="text-red-600">Venta a Ciegas?</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Muchos negocios pierden dinero por falta de control. No dejes que el tuyo sea uno de ellos.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className={`group relative p-8 rounded-3xl bg-gradient-to-br ${problem.gradient} border ${problem.borderColor} shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${problem.iconBg} flex items-center justify-center relative`}>
                                    <problem.icon className={`w-8 h-8 ${problem.iconColor}`} />
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
                                        <X className="w-3 h-3 text-white stroke-[3px]" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className='text-2xl font-bold text-slate-900'>
                                        {problem.title}
                                    </h3>
                                    <p className='text-slate-600 font-medium leading-relaxed'>
                                        {problem.description}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <AlertTriangle className="w-24 h-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subtle divider or background flourish */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </section>
    )
}
