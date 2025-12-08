import { X, Check } from 'lucide-react'

export function ProblemSolutionSection() {
    return (
        <section className='py-16 md:py-24 bg-white'>
            <div className='container mx-auto px-4'>
                <div className='max-w-4xl mx-auto'>
                    <h2 className='text-3xl md:text-4xl font-bold text-navy mb-8'>
                        ¿Cansado de la Venta a Ciegas?
                    </h2>
                    <div className='space-y-4 mb-8'>
                        <div className='flex items-start gap-3'>
                            <div className='mt-1 bg-red-100 p-1 rounded-full'>
                                <X className='w-5 h-5 text-red-600' />
                            </div>
                            <p className='text-lg text-gray-700'>
                                Uso de libretas o excel que no te dan las cuentas en Tiempo Real.
                            </p>
                        </div>
                        <div className='flex items-start gap-3'>
                            <div className='mt-1 bg-red-100 p-1 rounded-full'>
                                <X className='w-5 h-5 text-red-600' />
                            </div>
                            <p className='text-lg text-gray-700'>
                                Nunca te quedes sin stock... "Simplifica la complejidad".
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
