import { useTranslations } from 'next-intl'
import Container from '@/components/shared/Container'
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react'
import ContactForm from '@/components/shared/contact-form'

export default function ContactPage() {
    const t = useTranslations('publicPages.contact')

    return (
        <div className="flex-1 bg-white">
            {/* Hero & Form Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-50 blur-3xl rounded-full -ml-32 -mt-32"></div>

                <Container>
                    <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                        {/* Info Side */}
                        <div className="flex-1 space-y-12">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                                    {t('title')}
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                                    {t('subtitle')}
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6 group">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{t('location')}</h4>
                                        <p className="text-gray-600">Av. Insurgentes Sur 1234, CDMX, México</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">Email</h4>
                                        <p className="text-gray-600">contacto@comerciofacil.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">Teléfono</h4>
                                        <p className="text-gray-600">+52 55 1234 5678</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <h4 className="text-lg font-bold text-gray-900 mb-6">{t('followUs')}</h4>
                                <div className="flex gap-4">
                                    {[
                                        { icon: Facebook, href: '#' },
                                        { icon: Instagram, href: '#' },
                                        { icon: Twitter, href: '#' },
                                    ].map((social, i) => (
                                        <a
                                            key={i}
                                            href={social.href}
                                            className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm border border-gray-100"
                                        >
                                            <social.icon className="w-5 h-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="flex-1 lg:max-w-xl">
                            <ContactForm />
                        </div>
                    </div>
                </Container>
            </section>

            {/* Map Placeholder or Decoration */}
            <section className="h-[400px] bg-gray-100 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none z-10"></div>
                <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
                    <div className="text-center italic text-gray-400 font-bold">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        Integración de Google Maps aquí
                    </div>
                </div>
            </section>
        </div>
    )
}
