'use client'

import { useTranslations } from 'next-intl'
import Container from '@/components/shared/Container'
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'
import ContactForm from '@/components/shared/contact-form'
import GoogleMapComponent from '@/components/shared/google-map'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { APP_EMAIL, APP_PHONE } from '@/lib/constants'

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

export default function ContactPage() {
    const t = useTranslations('publicPages.contact')

    return (
        <div className="flex-1 bg-[#FAFAFA] overflow-hidden">
            {/* Hero Section with Mesh Gradient */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* mesh gradients */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/40 blur-[120px] rounded-full -mr-96 -mt-96 animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-navy-100/30 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none"></div>

                <Container>
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative z-10">
                        {/* Info Side */}
                        <div className="flex-1 space-y-16">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange border border-orange-100 rounded-full text-sm font-bold tracking-wide uppercase">
                                    <Sparkles className="w-4 h-4" />
                                    <span>{t('title')}</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-navy tracking-tight leading-[0.95]">
                                    Estamos para <br />
                                    <span className="text-orange">ayudarte.</span>
                                </h1>
                                <p className="text-xl text-navy/60 leading-relaxed max-w-lg font-medium">
                                    {t('subtitle')}
                                </p>
                            </motion.div>

                            {/* Bento Grid Info Cards */}
                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <motion.div
                                    variants={fadeInUp}
                                    className="md:col-span-2 group relative p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-navy-900/5 hover:shadow-2xl hover:shadow-navy-900/10 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <MapPin className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <div className="w-14 h-14 bg-orange-50 text-orange rounded-2xl flex items-center justify-center border border-orange-100 group-hover:bg-orange group-hover:text-white transition-all duration-300">
                                            <MapPin className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-navy mb-2">{t('location')}</h4>
                                            <p className="text-navy/60 text-lg leading-relaxed max-w-md">
                                                Av. Insurgentes Sur 1234, Col. Insurgentes San Borja, CDMX, México.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl border-orange-100 text-orange hover:bg-orange hover:text-white font-bold group"
                                            onClick={() =>
                                                window.open(
                                                    'https://www.google.com/maps/search/?api=1&query=Av.+Insurgentes+Sur+1234,+CDMX,+Mexico',
                                                    '_blank'
                                                )
                                            }
                                        >
                                            Ver ubicación <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    className="group p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-navy-900/5 hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-navy-50 text-navy rounded-xl flex items-center justify-center border border-navy-100 group-hover:bg-navy group-hover:text-white transition-all duration-300">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-navy mb-1">Email</h4>
                                            <a
                                                href={`mailto:${APP_EMAIL}`}
                                                className="text-navy/60 font-medium hover:text-orange transition-colors truncate block"
                                            >
                                                {APP_EMAIL}
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    className="group p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-navy-900/5 hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 bg-navy-50 text-navy rounded-xl flex items-center justify-center border border-navy-100 group-hover:bg-navy group-hover:text-white transition-all duration-300">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-navy mb-1">Teléfono</h4>
                                            <a
                                                href={`tel:${APP_PHONE.replace(/\s+/g, '')}`}
                                                className="text-navy/60 font-medium hover:text-orange transition-colors"
                                            >
                                                {APP_PHONE}
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Social Connectivity */}
                            <motion.div variants={fadeInUp} className="flex items-center gap-6">
                                <span className="text-sm font-black text-navy/40 uppercase tracking-widest">{t('followUs')}</span>
                                <div className="h-[1px] flex-1 bg-gray-100"></div>
                                <div className="flex gap-4">
                                    {[
                                        { icon: Facebook, href: '#', label: 'Facebook' },
                                        { icon: Instagram, href: '#', label: 'Instagram' },
                                        { icon: Twitter, href: '#', label: 'Twitter' },
                                    ].map((social, i) => (
                                        <a
                                            key={i}
                                            href={social.href}
                                            aria-label={social.label}
                                            className="w-12 h-12 bg-white text-navy/40 rounded-full flex items-center justify-center border border-gray-100 shadow-sm hover:bg-orange hover:text-white hover:border-orange transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <social.icon className="w-5 h-5" />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Form Side */}
                        <div className="flex-1 lg:max-w-[480px]">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="relative"
                            >
                                {/* abstract decoration behind form */}
                                <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-orange-400/10 blur-[60px] rounded-full animate-bounce duration-[3000ms]"></div>
                                <div className="absolute -z-10 -bottom-12 -left-12 w-64 h-64 bg-navy-400/5 blur-[60px] rounded-full animate-pulse"></div>

                                <div className="relative bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-1 overflow-hidden">
                                    {/* Inner subtle glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-orange-50/10 pointer-events-none"></div>
                                    <ContactForm />
                                </div>

                                <div className="mt-8 p-6 bg-navy text-white rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-navy-dark transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-orange" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">¿Eres cliente?</p>
                                            <p className="font-bold">Ir al centro de ayuda</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-orange group-hover:border-orange transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Immersive Map Area */}
            <section className="relative px-6 pb-24 group">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative max-w-[1400px] mx-auto h-[600px] rounded-[4rem] overflow-hidden shadow-2xl shadow-navy-900/10 border-4 border-white"
                >
                    <GoogleMapComponent />

                    {/* Floating Map Overlay */}
                    <div className="absolute bottom-12 left-12 right-12 md:left-auto lg:right-24 bg-navy/90 backdrop-blur-md p-8 md:w-[400px] rounded-[3rem] text-white border border-white/10 shadow-2xl z-20 hidden md:block group-hover:-translate-y-2 transition-transform duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-orange rounded-2xl flex items-center justify-center shadow-lg shadow-orange/20">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">Visítanos</h3>
                                <p className="text-sm text-white/60 uppercase font-bold tracking-widest">Sucursal Principal</p>
                            </div>
                        </div>
                        <p className="text-lg text-white/80 leading-relaxed mb-8">
                            Nuestras puertas están abiertas para brindarte una asesoría personalizada sobre tu negocio.
                        </p>
                        <Link
                            href="https://www.google.com/maps/search/?api=1&query=Av.+Insurgentes+Sur+1234,+CDMX,+Mexico"
                            target="_blank"
                            className="flex items-center justify-between p-4 bg-white/10 hover:bg-orange rounded-2xl transition-all font-bold"
                        >
                            Ver en Maps
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>

                {/* Decorative textures */}
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none"></div>
            </section>
        </div>
    )
}
