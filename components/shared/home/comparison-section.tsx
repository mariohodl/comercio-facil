import { Check, X, Shield, Smartphone, Globe, Cloud, Monitor, Zap, ArrowRight } from 'lucide-react'

export function ComparisonSection() {
    const comparisonData = [
        {
            feature: "Plataforma",
            us: "Nativo en la Nube + Modo Offline",
            them: "Software de escritorio (Local)",
            icon: Cloud,
            benefit: "Vende desde cualquier lugar, con o sin internet. Sin instalaciones."
        },
        {
            feature: "Dispositivos",
            us: "Celulares, Tablets, PC y Mac",
            them: "Solo computadoras Windows",
            icon: Smartphone,
            benefit: "Atiende a tus clientes desde tu celular o cualquier equipo que ya tengas."
        },
        {
            feature: "Licenciamiento",
            us: "Pago por tienda (Cajas Ilimitadas)",
            them: "Pago por cada computadora",
            icon: Zap,
            benefit: "Ahorra eliminando pagos extras por cada terminal que agregues."
        },
        {
            feature: "Multisucursal",
            us: "Centralizado en Tiempo Real",
            them: "Sincronización manual compleja",
            icon: Globe,
            benefit: "Monitorea todas tus tiendas desde tu celular al instante."
        },
        {
            feature: "Facilidad de Uso",
            us: "Interfaz Moderna e Intuitiva",
            them: "Interfaces antiguas y lentas",
            icon: Monitor,
            benefit: "Capacita a tu personal en minutos. Sin manuales interminables."
        },
        {
            feature: "Mantenimiento",
            us: "Actualizaciones Gratis de por vida",
            them: "Actualizaciones con costo extra",
            icon: Shield,
            benefit: "Siempre tendrás la última versión con nuevas funciones sin pagar más."
        }
    ]

    return (
        <section id="comparison" className="relative py-24 md:py-32 bg-slate-900 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4 font-bold text-sm tracking-wider uppercase">
                        ¿Por qué es mejor Comercio Fácil?
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                        La evolución de tu punto de venta <span className="text-orange-500">está aquí</span>
                    </h2>
                    <p className="text-lg text-slate-400 font-medium">
                        Compara la libertad de un sistema moderno frente a las limitaciones de los sistemas de escritorio tradicionales.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    {/* Header for the comparison table - hidden on mobile */}
                    <div className="hidden md:grid grid-cols-12 gap-0 mb-8 px-8 py-4 bg-slate-800/30 rounded-2xl border border-slate-800">
                        <div className="col-span-3 text-slate-500 font-bold uppercase text-xs tracking-widest">Característica</div>
                        <div className="col-span-4 text-orange-500 font-bold uppercase text-xs tracking-widest">Comercio Fácil</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-4 text-slate-600 font-bold uppercase text-xs tracking-widest">Sistemas Tradicionales</div>
                    </div>

                    <div className="space-y-4">
                        {comparisonData.map((item, index) => (
                            <div
                                key={index}
                                className="group relative bg-slate-800/40 border border-slate-800 rounded-3xl p-6 md:p-8 transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-800/60"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 md:gap-4 items-center gap-8">
                                    {/* Feature Name & Icon */}
                                    <div className="col-span-3 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-500">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{item.feature}</h3>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest md:hidden mb-2 pt-1">{item.feature}</p>
                                        </div>
                                    </div>

                                    {/* Us */}
                                    <div className="col-span-4 lg:col-span-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                                            </div>
                                            <div className="font-bold text-white leading-tight">
                                                {item.us}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-400 leading-relaxed font-medium md:hidden lg:block">
                                            {item.benefit}
                                        </div>
                                    </div>

                                    {/* Divider/VS */}
                                    <div className="hidden lg:flex col-span-1 justify-center">
                                        <ArrowRight className="w-4 h-4 text-slate-700" />
                                    </div>

                                    {/* Them */}
                                    <div className="col-span-4 lg:col-span-3 opacity-40 group-hover:opacity-60 transition-opacity">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                                <X className="w-3.5 h-3.5 text-slate-400" strokeWidth={3} />
                                            </div>
                                            <div className="font-medium text-slate-300 leading-tight">
                                                {item.them}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional benefit for MD view (when LG is hidden) */}
                                    <div className="col-span-12 hidden md:block lg:hidden mt-4 pt-4 border-t border-slate-700/50 text-sm text-slate-400">
                                        {item.benefit}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex flex-wrap justify-center gap-4 p-2 rounded-[2rem] bg-slate-800/40 border border-slate-800">
                        <div className="px-6 py-3 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-white font-bold text-sm">Sin contratos forzosos</span>
                        </div>
                        <div className="px-6 py-3 rounded-2xl flex items-center gap-3 border-l border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-white font-bold text-sm">Cobro por tienda</span>
                        </div>
                        <div className="px-6 py-3 rounded-2xl flex items-center gap-3 border-l border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-white font-bold text-sm">Prueba gratis</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
