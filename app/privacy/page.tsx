import Container from '@/components/shared/Container'
import { CustomH1 } from '@/components/shared/CustomH1'
import { CustomH2 } from '@/components/shared/CustomH2'
import { CustomP } from '@/components/shared/CustomP'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata = {
    title: 'Política de Privacidad | Comercio Fácil',
    description: 'Aviso de privacidad y términos de manejo de datos de Comercio Fácil.',
}

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen py-12 md:py-20 animate-in fade-in duration-700">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Legal</span>
                    </div>

                    <CustomH1 classNames="mb-4 text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                        Política de Privacidad
                    </CustomH1>

                    <CustomP classNames="text-sm text-gray-500 mb-12">
                        Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </CustomP>

                    <div className="prose prose-blue max-w-none space-y-12">
                        <section>
                            <CustomH2 classNames="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
                                1. Introducción
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed">
                                En <strong>Comercio Fácil</strong>, valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos y compartimos su información cuando utiliza nuestra plataforma y servicios.
                            </CustomP>
                        </section>

                        <section>
                            <CustomH2 classNames="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
                                2. Información que Recopilamos
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed mb-4">
                                Recopilamos información necesaria para proporcionar y mejorar nuestros servicios, incluyendo:
                            </CustomP>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 leading-relaxed">
                                <li><strong>Datos de Registro:</strong> Nombre, correo electrónico, número de teléfono y contraseña.</li>
                                <li><strong>Datos de Empresa:</strong> Nombre de la empresa, dirección fiscal, ID fiscal (RFC u otros) y detalles de la tienda.</li>
                                <li><strong>Datos de Autenticación Social:</strong> Cuando inicia sesión con Google, Facebook o Instagram, recibimos su nombre, correo electrónico e imagen de perfil según los permisos que usted otorgue.</li>
                                <li><strong>Datos de Uso:</strong> Información sobre cómo interactúa con nuestra plataforma, incluyendo inventarios, ventas y reportes creados.</li>
                            </ul>
                        </section>

                        <section>
                            <CustomH2 classNames="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
                                3. Cómo Utilizamos su Información
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed mb-4">
                                Utilizamos los datos recopilados para:
                            </CustomP>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 leading-relaxed">
                                <li>Proveer y mantener nuestra plataforma de gestión comercial.</li>
                                <li>Procesar sus transacciones y gestionar su cuenta.</li>
                                <li>Enviar notificaciones técnicas, actualizaciones y alertas de seguridad.</li>
                                <li>Personalizar su experiencia y mejorar nuestras herramientas de análisis.</li>
                                <li>Cumplir con obligaciones legales y prevenir fraudes.</li>
                            </ul>
                        </section>

                        <section>
                            <CustomH2 classNames="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
                                4. Seguridad de los Datos
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed">
                                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la pérdida o la alteración. Sus datos se almacenan en servidores seguros y las conexiones sensibles están cifradas mediante SSL/TLS.
                            </CustomP>
                        </section>

                        <section>
                            <CustomH2 classNames="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
                                5. Sus Derechos
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed mb-4">
                                Usted tiene derecho a:
                            </CustomP>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 leading-relaxed">
                                <li>Acceder y rectificar sus datos personales en cualquier momento.</li>
                                <li>Solicitar la eliminación de sus datos (Derecho al Olvido).</li>
                                <li>Oponerse o limitar el procesamiento de su información.</li>
                                <li>Retirar su consentimiento para el marketing directo.</li>
                            </ul>
                            <CustomP classNames="text-gray-600 leading-relaxed mt-4">
                                Para ejercer estos derechos, puede enviarnos un correo electrónico a <a href="mailto:privacidad@comerciofacil.com.mx" className="text-blue-600 font-medium">privacidad@comerciofacil.com.mx</a>.
                            </CustomP>
                        </section>

                        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                            <CustomH2 classNames="text-xl font-bold text-gray-800 mb-4">
                                Instrucciones de Eliminación de Datos (Social Auth)
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed">
                                Si desea eliminar los datos vinculados desde Facebook o Instagram, por favor siga nuestras <Link href="/data-deletion" className="text-blue-600 font-bold hover:underline">instrucciones de eliminación de datos paso a paso</Link>.
                            </CustomP>
                        </section>

                        <section>
                            <CustomH2 classNames="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
                                6. Cambios en esta Política
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed">
                                Podremos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de última actualización.
                            </CustomP>
                        </section>

                        <section className="text-center pt-12">
                            <CustomP classNames="text-gray-500 italic">
                                Para cualquier duda sobre esta política, contáctenos en:<br />
                                <span className="font-bold text-gray-900">contacto@comerciofacil.com.mx</span>
                            </CustomP>
                        </section>
                    </div>
                </div>
            </Container>
        </div>
    )
}
