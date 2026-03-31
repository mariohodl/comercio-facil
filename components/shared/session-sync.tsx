'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SessionSync({ redirectUrl }: { redirectUrl: string }) {
    const { update } = useSession()
    const router = useRouter()

    useEffect(() => {
        const sync = async () => {
            console.log('SYNC: Refreshing stale session...')
            await update()
            router.refresh()
            // Small delay to ensure cookie is written
            setTimeout(() => {
                router.push(redirectUrl + '?verified=1')
            }, 500)
        }
        sync()
    }, [update, router, redirectUrl])

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-orange-100 animate-ping opacity-20" />
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">Sincronizando sesión...</h3>
                <p className="text-sm text-gray-500 mt-1">Detectamos que ya verificaste tu cuenta. Redirigiendo al panel.</p>
            </div>
        </div>
    )
}
