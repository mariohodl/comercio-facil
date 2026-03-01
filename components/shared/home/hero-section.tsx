import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function HeroSection() {
    return (
        <section className='relative overflow-hidden bg-gradient-to-b from-white via-blue-50/50 to-white pt-10 pb-16 md:pt-16  md:pb-30'>
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl"></div>
                <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-orange-100/40 to-yellow-100/40 blur-3xl"></div>
            </div>

            <div className='container mx-auto px-4 relative z-10'>
                <div className='flex flex-col items-center text-center max-w-5xl mx-auto space-y-8'>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-600">La plataforma #1 para comercio local</span>
                    </div>

                    <h1 className='text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]'>
                        Comercio Fácil: <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1976D2] to-[#0D47A1]">Eficiencia Operativa</span> al 100%
                    </h1>

                    <p className='text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
                        Tome el control total y haga crecer su negocio: unifique el inventario, agilice sus ventas en el POS y conozca su negocio a fondo con datos siempre actualizados.
                    </p>

                    <div className='flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center'>
                        <Button size='lg' className='bg-[#FF9800] hover:bg-[#F57C00] text-white rounded-full px-8 py-7 text-lg font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-105 w-full sm:w-auto' asChild>
                            <Link href='/admin'>
                                Comenzar Gratis<ArrowRight className='ml-2 h-5 w-5' />
                            </Link>
                        </Button>
                        <Button size='lg' variant="outline" className='rounded-full px-8 py-7 text-lg font-medium border-gray-200 hover:bg-gray-50 text-gray-700 w-full sm:w-auto' asChild>
                            <Link href='#features'>
                                Ver Características
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-8 flex flex-wrap justify-center items-center gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        {[
                            "Planes a su medida",
                            "Instalación inmediata",
                            "Soporte 24/7",
                            "Seguridad Garantizada"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full shadow-sm text-gray-600 text-sm font-medium hover:bg-white hover:shadow-md hover:scale-105 hover:border-blue-100 transition-all duration-300 cursor-default group">
                                <div className="rounded-full bg-green-50 p-0.5 group-hover:bg-green-100 transition-colors">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={3} />
                                </div>
                                <span className="group-hover:text-gray-900 transition-colors">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto"> */}
                {/* <div className="relative rounded-3xl bg-gray-900 p-2 md:p-4 shadow-2xl shadow-blue-900/20 border border-gray-800/50 backdrop-blur-sm">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-20"></div>
                        <div className="relative rounded-2xl overflow-hidden bg-white aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
                            <div className="w-full h-full bg-gray-50 flex flex-col">
                                <div className="h-14 border-b border-gray-200 bg-white flex items-center px-6 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                                        <div className="w-32 h-4 bg-gray-100 rounded-full"></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 flex gap-6">
                                    <div className="w-64 hidden md:block space-y-3">
                                        <div className="h-10 bg-blue-50 rounded-lg w-full"></div>
                                        <div className="h-10 bg-white rounded-lg w-full"></div>
                                        <div className="h-10 bg-white rounded-lg w-full"></div>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4"></div>
                                            <div className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4"></div>
                                            <div className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4"></div>
                                        </div>
                                        <div className="h-64 bg-white rounded-xl border border-gray-100 shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                {/* Floating Phone */}
                {/* <div className="absolute -bottom-12 -right-4 md:-right-12 w-[120px] md:w-[240px] aspect-[1/2] bg-black rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-gray-900 shadow-2xl transform rotate-[-10deg] hidden sm:block">
                        <div className="w-full h-full bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
                            <div className="w-full h-full bg-blue-50"></div>
                        </div>
                    </div> */}
                {/* </div> */}
            </div>
        </section>
    )
}
