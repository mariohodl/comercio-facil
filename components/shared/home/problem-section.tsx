import { AlertTriangle, PackageX, ReceiptText, X } from 'lucide-react'

export function ProblemSection() {
    const problems = [
        {
            icon: PackageX,
            title: 'Pérdida de Stock',
            description: 'Evitamos que nunca sepas qué tienes disponible y pierdas ventas por falta de inventario real.',
            gradient: 'from-rose-50 to-red-50',
            borderColor: 'border-red-100',
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100',
        },
        {
            icon: ReceiptText,
            title: 'Desorden en Caja',
            description: 'Cierres de caja que no cuadran y fugas de capital sin identificar. No permitas que esto siga pasando.',
            gradient: 'from-orange-50 to-amber-50',
            borderColor: 'border-orange-100',
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-100',
        }
    ]

    return (
        <section className='relative py-24 md:py-32 bg-slate-50/80 overflow-hidden'>
            {/* Background Decorations */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-red-100/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-orange-100/20 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            </div>

            <div className='container mx-auto px-4 md:px-8 relative z-20'>
                <div className="max-w-7xl mx-auto">
                    {/* Shadow & Background Wrapper */}
                    <div className="relative bg-white rounded-[3rem] md:rounded-[4.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100">
                        {/* Overflow-hidden Inner for Blurs */}
                        <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4.5rem] p-8 md:p-20">
                            {/* Internal Decorative Blurs */}
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-50/40 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-50/40 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                                    <h2 className='text-3xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]'>
                                        ¿Cansado de la <span className="text-red-600">Venta a Ciegas?</span>
                                    </h2>
                                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
                                        Muchos negocios pierden dinero por falta de control. No dejes que el tuyo sea uno de ellos.
                                    </p>
                                </div>

                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                    {problems.map((problem, index) => (
                                        <div
                                            key={index}
                                            className={`group relative p-8 md:p-10 rounded-[2rem] bg-gradient-to-br ${problem.gradient} border ${problem.borderColor} shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5`}
                                        >
                                            <div className="flex flex-col md:flex-row items-start gap-6">
                                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${problem.iconBg} flex items-center justify-center relative shadow-inner`}>
                                                    <problem.icon className={`w-8 h-8 ${problem.iconColor}`} />
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                        <X className="w-3 h-3 text-white stroke-[4px]" />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h3 className='text-2xl md:text-3xl font-bold text-slate-900 leading-tight'>
                                                        {problem.title}
                                                    </h3>
                                                    <p className='text-slate-600 font-medium text-lg leading-relaxed opacity-90'>
                                                        {problem.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Decorative background element */}
                                            <div className="absolute top-4 right-4 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-500 group-hover:scale-110">
                                                <AlertTriangle className="w-32 h-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
