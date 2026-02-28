import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                        <WifiOff className="w-10 h-10 text-orange-500" />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Sin conexión
                </h1>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                    No hay internet disponible. Verifica tu conexión y vuelve a intentarlo.
                    <br />
                    <span className="font-medium text-gray-700">Las ventas realizadas se sincronizarán automáticamente al reconectarte.</span>
                </p>

                {/* Retry button */}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                    Reintentar
                </button>

                {/* Go home link */}
                <Link
                    href="/"
                    className="block mt-4 text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                    Ir al inicio
                </Link>
            </div>

            {/* App branding */}
            <p className="mt-8 text-xs text-gray-400">
                Comercio Fácil — POS & Inventario
            </p>
        </div>
    )
}
