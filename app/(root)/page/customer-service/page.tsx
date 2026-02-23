import { useTranslations } from 'next-intl'
import Container from '@/components/shared/Container'
import { Phone, Mail, MessageSquare, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CustomerServicePage() {
    const t = useTranslations('publicPages.customerService')

    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <section className="bg-blue-600 py-16 text-white text-center rounded-b-[3rem] shadow-lg shadow-blue-500/10">
                <Container>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        {t('subtitle')}
                    </p>
                </Container>
            </section>

            {/* Contact Options */}
            <section className="py-24">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-20">
                        <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-blue-900/5 border border-gray-50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                                <Phone className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('phoneSupport')}</h3>
                            <p className="text-gray-600 mb-6 font-medium">{t('phoneDesc')}</p>
                            <a href="tel:5512345678" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                +52 55 1234 5678
                            </a>
                            <div className="mt-8 pt-8 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Atención inmediata en horario laboral</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-blue-900/5 border border-gray-50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('emailSupport')}</h3>
                            <p className="text-gray-600 mb-6 font-medium">{t('emailDesc')}</p>
                            <a href="mailto:soporte@comerciofacil.com" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors break-all">
                                soporte@comerciofacil.com
                            </a>
                            <div className="mt-8 pt-8 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-gray-400">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-sm font-medium">Soporte 24/7 vía tickets</span>
                            </div>
                        </div>
                    </div>

                    {/* FAQ CTA */}
                    <div className="mt-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden text-center text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('faqCTA')}</h2>
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 rounded-full font-bold px-10 h-14 text-lg shadow-xl" asChild>
                                <Link href="/page/help">
                                    {t('faqButton')}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}
