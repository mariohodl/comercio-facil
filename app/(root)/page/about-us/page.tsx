import { useTranslations } from 'next-intl'
import Container from '@/components/shared/Container'
import { Building2, Heart, Users2, Rocket } from 'lucide-react'

export default function AboutUsPage() {
    const t = useTranslations('publicPages.aboutUs')

    return (
        <div className="flex-1 bg-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
                <Container>
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-600 font-bold mb-8 italic">
                            {t('subtitle')}
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {t('description')}
                        </p>
                    </div>
                </Container>
            </section>

            {/* Core Values */}
            <section className="py-24">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('values')}</h2>
                        <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('value1Title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('value1Desc')}</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('value2Title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('value2Desc')}</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('value3Title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('value3Desc')}</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* History Section */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <Container>
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-blue-600 font-bold text-xs uppercase tracking-widest border border-blue-100 shadow-sm mb-6">
                                <Users2 className="w-4 h-4" />
                                {t('history')}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Construyendo el futuro del <span className="text-blue-600">Comercio Local</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                {t('historyContent')}
                            </p>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-square bg-blue-600 rounded-3xl overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-12">
                                    <Building2 className="w-full h-full text-white/10" />
                                </div>
                            </div>
                            {/* Decoration */}
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}
