'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PromoPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // Show popup after 5 seconds
        const timer = setTimeout(() => {
            const hasSeenPromo = sessionStorage.getItem('seen_promo_exito2026')
            if (!hasSeenPromo) {
                setIsOpen(true)
            }
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        sessionStorage.setItem('seen_promo_exito2026', 'true')
    }

    const copyCode = () => {
        navigator.clipboard.writeText('EXITO2026')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Gift Icon */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-md rotate-3">
                            🎁
                        </div>

                        <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-gray-900 leading-tight">
                                ¡Regalo Exclusivo!
                            </h3>
                            <p className="text-sm text-gray-500 leading-snug">
                                Obtén <span className="text-blue-600 font-semibold">3 meses gratis</span> extra en planes anuales.
                            </p>
                        </div>
                    </div>

                    {/* Coupon Code & Action */}
                    <div className="mt-4 flex items-center gap-2">
                        <div
                            className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between group hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={copyCode}
                        >
                            <code className="text-sm font-bold text-gray-700 font-mono tracking-wide">EXITO2026</code>
                            <div className={cn("text-gray-400 transition-colors", copied && "text-green-600")}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </div>
                        </div>

                        <Button asChild size="sm" className="bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all active:scale-95">
                            <Link href="/sign-up?promo=EXITO2026">
                                Canjear
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
