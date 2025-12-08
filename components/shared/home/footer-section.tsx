import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShieldCheck, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function FooterSection() {
    return (
        <footer className='bg-gray-950 text-white pt-20 pb-10 border-t border-gray-900'>
            <div className='container mx-auto px-4'>

                {/* Top Section: CTA & Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
                    <div className="space-y-6">
                        <h2 className='text-3xl md:text-4xl font-bold leading-tight'>
                            ¿Listo para escalar su negocio?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-md">
                            Únase a más de 5,000 comercios que ya gestionan su inventario de forma inteligente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size='lg' className='bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-blue-900/20' asChild>
                                <Link href='/admin'>
                                    Comenzar Ahora
                                </Link>
                            </Button>
                            <Button size='lg' variant="outline" className='rounded-full px-8 h-12 text-base font-medium border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white' asChild>
                                <Link href='#'>
                                    Contactar Ventas
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                        <h3 className="font-bold text-lg mb-2">Manténgase actualizado</h3>
                        <p className="text-gray-400 text-sm mb-6">Reciba consejos de gestión y noticias de la plataforma.</p>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input placeholder="su@email.com" className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-12" />
                            </div>
                            <Button className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl h-12 px-6">
                                Suscribirse
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-900 my-12"></div>

                {/* Middle Section: Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">CF</div>
                            <span className="font-bold text-xl">Comercio Fácil</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            La plataforma integral para la eficiencia operativa minorista. Centralice, venda y crezca con tecnología de punta.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="text-gray-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="text-gray-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-white">Producto</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Inventario</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Punto de Venta</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Reportes</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Facturación</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-white">Compañía</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Sobre Nosotros</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Carreras</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-white">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacidad</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Términos</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Seguridad</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className='border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600'>
                    <p>&copy; {new Date().getFullYear()} Comercio Fácil. Todos los derechos reservados.</p>
                    <div className='flex items-center gap-2 text-gray-500'>
                        <ShieldCheck className='w-4 h-4 text-green-500' />
                        <span>Plataforma Segura y Encriptada SSL</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
