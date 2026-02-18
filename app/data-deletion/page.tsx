import Container from '@/components/shared/Container'
import { CustomH1 } from '@/components/shared/CustomH1'
import { CustomH2 } from '@/components/shared/CustomH2'
import { CustomP } from '@/components/shared/CustomP'
import Link from 'next/link'
import { ArrowLeft, Trash2, Info } from 'lucide-react'

export const metadata = {
    title: 'Instrucciones de Eliminación de Datos | Comercio Fácil',
    description: 'Siga estos pasos para solicitar la eliminación de sus datos personales de Comercio Fácil.',
}

export default function DataDeletionPage() {
    return (
        <div className="bg-white min-h-screen py-12 md:py-20 animate-in slide-in-from-bottom duration-700">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/privacy"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a Privacidad
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <span className="text-red-600 font-bold uppercase tracking-wider text-sm">Eliminación de Datos</span>
                    </div>

                    <CustomH1 classNames="mb-6 text-4xl font-black text-gray-900 leading-tight">
                        Instrucciones para eliminar sus datos
                    </CustomH1>

                    <CustomP classNames="text-lg text-gray-600 mb-10 leading-relaxed">
                        En cumplimiento con la normativa de Facebook e Instagram y las leyes de protección de datos, proporcionamos un proceso sencillo para que los usuarios puedan solicitar la eliminación de su información personal.
                    </CustomP>

                    <div className="space-y-12">
                        <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-2xl shadow-sm">
                                    <Info className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <CustomH2 classNames="text-xl font-bold text-gray-800 mb-2">
                                        ¿Qué datos se eliminan?
                                    </CustomH2>
                                    <CustomP classNames="text-gray-600 leading-relaxed">
                                        Al solicitar la eliminación, eliminaremos permanentemente su perfil, correo electrónico, nombre, tiendas asociadas, inventarios y cualquier dato de autenticación social recibido de Google o Meta (Facebook/Instagram).
                                    </CustomP>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <CustomH2 classNames="text-2xl font-bold text-gray-800">
                                Método 1: Solicitud vía correo electrónico
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed">
                                Para solicitar la eliminación de sus datos de una sola vez, siga estos pasos:
                            </CustomP>
                            <ol className="list-decimal pl-6 space-y-4 text-gray-600">
                                <li className="pl-2">Utilice la dirección de correo electrónico asociada a su cuenta de Comercio Fácil.</li>
                                <li className="pl-2">Envíe un correo a <span className="font-bold text-gray-900 underline">privacidad@comerciofacil.com.mx</span>.</li>
                                <li className="pl-2">El asunto debe ser: <strong>"Solicitud de eliminación de datos personales"</strong>.</li>
                                <li className="pl-2">En el cuerpo del mensaje, incluya su nombre completo y una breve confirmación de que desea que se borren sus datos.</li>
                            </ol>
                            <CustomP classNames="text-gray-500 text-sm italic py-4">
                                * Procesaremos su solicitud en un plazo máximo de 72 horas hábiles.
                            </CustomP>
                        </section>

                        <section className="space-y-6">
                            <CustomH2 classNames="text-2xl font-bold text-gray-800">
                                Método 2: Desvincular desde Facebook
                            </CustomH2>
                            <CustomP classNames="text-gray-600 leading-relaxed">
                                Si desea revocar el acceso de nuestra aplicación directamente desde Facebook:
                            </CustomP>
                            <ol className="list-decimal pl-6 space-y-4 text-gray-600">
                                <li className="pl-2">Vaya a la configuración de su cuenta de Facebook.</li>
                                <li className="pl-2">Seleccione <strong>"Configuración y privacidad"</strong> y luego <strong>"Configuración"</strong>.</li>
                                <li className="pl-2">Busque la sección <strong>"Apps y sitios web"</strong>.</li>
                                <li className="pl-2">Encuentre <strong>Comercio Fácil</strong> y haga clic en <strong>Eliminar</strong>.</li>
                                <li className="pl-2">Siga las instrucciones en pantalla para confirmar la eliminación.</li>
                            </ol>
                        </section>

                        <div className="border-t border-gray-100 pt-10 text-center">
                            <CustomP classNames="text-gray-400 text-sm">
                                Comercio Fácil no almacena datos de los usuarios más allá de lo estrictamente necesario para el funcionamiento del servicio y el cumplimiento legal.
                            </CustomP>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
