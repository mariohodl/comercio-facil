'use client'

import { ArrowUp, Mail, Facebook, Twitter, Instagram, Linkedin, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { APP_NAME, APP_EMAIL, APP_PHONE } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-navy text-white pt-20 pb-10 border-t border-navy-900'>
      <div className='rounded-full fixed bottom-10 right-4 z-50'>
        <button
          className='bg-orange hover:bg-orange-dark cursor-pointer rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all transform hover:scale-110'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
        >
          <ArrowUp className='h-6 w-6 text-white' />
        </button>
      </div>

      <div className='container mx-auto px-6'>
        {/* Top Section: CTA & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6">
            <h2 className='text-3xl md:text-4xl font-black leading-tight'>
              ¿Listo para escalar su negocio?
            </h2>
            <p className="text-white/60 text-lg max-w-md font-medium">
              Únase a miles de comercios que ya gestionan su inventario de forma inteligente con {APP_NAME}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size='lg' className='bg-orange hover:bg-orange-dark text-white rounded-full px-8 h-12 text-base font-black shadow-lg shadow-orange/20 border-none' asChild>
                <Link href='/sign-in'>
                  Comenzar Ahora
                </Link>
              </Button>
              <Button size='lg' variant="outline" className='rounded-full px-8 h-12 text-base font-bold border-white/20 text-navy bg-white hover:bg-white/90 hover:border-white/40' asChild>
                <Link href='/page/contact'>
                  Contactar Ventas
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-navy-dark/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
            <h3 className="font-black text-xl mb-2">Manténgase actualizado</h3>
            <p className="text-white/50 text-sm mb-6 font-medium">Reciba consejos de gestión y noticias de la plataforma.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input placeholder="su@email.com" className="pl-11 bg-navy-dark border-white/10 text-white placeholder:text-white/20 rounded-xl h-12" />
              </div>
              <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-12 px-6 font-bold border-none">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 my-12"></div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/imagotipo.png"
                  alt={APP_NAME}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-black text-2xl tracking-tight">{APP_NAME}</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs font-medium">
              La plataforma integral para la eficiencia operativa minorista. Centralice, venda y crezca con tecnología de punta.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-orange hover:bg-white/10 transition-all"><Facebook className="w-5 h-5" /></Link>
              <Link href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-orange hover:bg-white/10 transition-all"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-orange hover:bg-white/10 transition-all"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-orange hover:bg-white/10 transition-all"><Linkedin className="w-5 h-5" /></Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-white tracking-wider uppercase text-xs">Directorio</h4>
            <ul className="space-y-3 text-sm font-medium text-white/40 font-medium">
              <li><Link href="/page/contact" className="hover:text-orange transition-colors">Contacto</Link></li>
              <li><Link href="/page/about-us" className="hover:text-orange transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/page/customer-service" className="hover:text-orange transition-colors">Servicio al Cliente</Link></li>
              <li><Link href="/page/help" className="hover:text-orange transition-colors">Ayuda</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-white tracking-wider uppercase text-xs">Contacto Directo</h4>
            <ul className="space-y-3 text-sm text-white/40 font-medium">
              <li className="flex flex-col">
                <span className="text-[10px] text-white/20 uppercase font-black mb-1">Email</span>
                <a href={`mailto:${APP_EMAIL}`} className="hover:text-orange transition-colors break-all">{APP_EMAIL}</a>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] text-white/20 uppercase font-black mb-1">Teléfono</span>
                <a href={`tel:${APP_PHONE.replace(/\s+/g, '')}`} className="hover:text-orange transition-colors">{APP_PHONE}</a>
              </li>
              <li>
                <span className="text-[10px] text-white/20 uppercase font-black mb-1">Horario</span>
                <p>Lunes - Viernes 9:00am - 6:00pm</p>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-white tracking-wider uppercase text-xs">Legal</h4>
            <ul className="space-y-3 text-sm text-white/40 font-medium">
              <li><Link href="/privacy" className="hover:text-orange transition-colors">Privacidad</Link></li>
              <li><Link href="/data-deletion" className="hover:text-orange transition-colors">Eliminación de Datos</Link></li>
              <li><Link href="#" className="hover:text-orange transition-colors">Términos de Servicio</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-white/30 uppercase tracking-widest'>
          <p>Copyright © {currentYear}, {APP_NAME}, Inc. Todos los derechos reservados.</p>
          <div className='flex items-center gap-3 text-white/20'>
            <ShieldCheck className='w-4 h-4 text-emerald-500' />
            <span>Infraestructura Segura y Encriptada SSL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}