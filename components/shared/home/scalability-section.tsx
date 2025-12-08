import { MapPin, ShoppingBag, Globe2 } from 'lucide-react'

export function ScalabilitySection() {
    return (
        <section className='py-24 bg-[#0F172A] text-white overflow-hidden relative'>
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className='container mx-auto px-4 relative z-10'>
                <div className='text-center max-w-3xl mx-auto mb-20'>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-sm font-bold uppercase tracking-wide mb-6 border border-white/10">
                        <Globe2 className="w-4 h-4" />
                        Roadmap 2026
                    </div>
                    <h2 className='text-4xl md:text-5xl font-bold mb-6 tracking-tight'>
                        El Futuro del Comercio Local
                    </h2>
                    <p className='text-xl text-gray-400 leading-relaxed'>
                        Nuestra visión trasciende la gestión interna. Estamos construyendo el puente hacia la venta online masiva y el comercio de proximidad.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
                    {/* Card 1 */}
                    <div className='group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 hover:from-green-500/50 hover:to-blue-500/50 transition-all duration-500'>
                        <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-[#0F172A] rounded-[22px] p-8 md:p-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShoppingBag className="w-32 h-32" />
                            </div>
                            <div className='w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400'>
                                <ShoppingBag className='w-7 h-7' />
                            </div>
                            <h3 className='text-2xl font-bold mb-4'>Marketplace Integrado</h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Publique su catálogo de inventario activo a una red de clientes potenciales, al estilo de las grandes plataformas, pero con una comisión justa.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className='group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-500'>
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-[#0F172A] rounded-[22px] p-8 md:p-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MapPin className="w-32 h-32" />
                            </div>
                            <div className='w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400'>
                                <MapPin className='w-7 h-7' />
                            </div>
                            <h3 className='text-2xl font-bold mb-4'>Geo-Commerce</h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Los clientes que busquen sus productos serán dirigidos a su punto de venta físico más cercano, impulsando el tráfico a su local.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
