import { useTranslations } from 'next-intl'
import Container from '@/components/shared/Container'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Search, HelpCircle, BookOpen, Lightbulb } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function HelpPage() {
    const t = useTranslations('publicPages.help')

    return (
        <div className="flex-1 bg-white">
            {/* Search Header */}
            <section className="bg-gray-900 py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-blue-900/20 blur-3xl"></div>

                <Container>
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-400 rounded-full border border-blue-500/20 mb-6 font-bold text-xs uppercase tracking-widest">
                            <HelpCircle className="w-4 h-4" />
                            {t('title')}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                            {t('subtitle')}
                        </h1>

                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <Input
                                placeholder="Buscas algo en específico..."
                                className="h-14 pl-12 pr-6 bg-white/5 border-white/10 text-white rounded-2xl focus:bg-white/10 transition-all text-lg"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            {/* Quick Topics */}
            <section className="py-20 -mt-16 relative z-10">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 group hover:border-blue-500 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Primeros Pasos</h3>
                            <p className="text-gray-500">Aprende a configurar tu inventario y realizar tu primera venta.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 group hover:border-blue-500 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Lightbulb className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Guías de Uso</h3>
                            <p className="text-gray-500">Manuales detallados sobre cada módulo de la plataforma.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 group hover:border-blue-500 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Soporte Técnico</h3>
                            <p className="text-gray-500">¿Tienes problemas técnicos? Estamos aquí para ayudarte.</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* FAQs */}
            <section className="py-20">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('frequentlyAsked')}</h2>
                            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                        </div>

                        <Accordion type="single" collapsible className="space-y-4">
                            <AccordionItem value="item-1" className="border border-gray-100 bg-gray-50/50 rounded-2xl px-6">
                                <AccordionTrigger className="text-lg font-bold text-gray-900 hover:no-underline py-6">
                                    {t('q1')}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-lg leading-relaxed pb-6">
                                    {t('a1')}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border border-gray-100 bg-gray-50/50 rounded-2xl px-6">
                                <AccordionTrigger className="text-lg font-bold text-gray-900 hover:no-underline py-6">
                                    {t('q2')}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-lg leading-relaxed pb-6">
                                    {t('a2')}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border border-gray-100 bg-gray-50/50 rounded-2xl px-6">
                                <AccordionTrigger className="text-lg font-bold text-gray-900 hover:no-underline py-6">
                                    {t('q3')}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-lg leading-relaxed pb-6">
                                    {t('a3')}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4" className="border border-gray-100 bg-gray-50/50 rounded-2xl px-6">
                                <AccordionTrigger className="text-lg font-bold text-gray-900 hover:no-underline py-6">
                                    {t('q4')}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-lg leading-relaxed pb-6">
                                    {t('a4')}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </Container>
            </section>
        </div>
    )
}
