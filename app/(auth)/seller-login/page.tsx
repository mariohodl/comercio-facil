'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Delete, ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Seller {
    _id: string
    name: string
    email: string
    image?: string
    hasPin: boolean
}

export default function SellerLoginPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const companyId = searchParams.get('companyId')

    const [sellers, setSellers] = useState<Seller[]>([])
    const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(true)
    const [authenticating, setAuthenticating] = useState(false)
    const [error, setError] = useState('')
    const [shake, setShake] = useState(false)

    // Fetch sellers for this company
    useEffect(() => {
        const storeId = searchParams.get('storeId')
        let activeCompanyId = companyId;
        let activeStoreId = storeId;

        if (!activeCompanyId && !activeStoreId) {
            const saved = localStorage.getItem('last_pos_store');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    activeCompanyId = parsed.companyId;
                    activeStoreId = parsed.storeId;
                } catch (e) {
                    console.error('Error parsing last_pos_store', e);
                }
            }
        }

        if (!activeCompanyId && !activeStoreId) {
            setLoading(false);
            return;
        }

        const queryParams = new URLSearchParams();
        if (activeCompanyId) queryParams.set('companyId', activeCompanyId);
        if (activeStoreId) queryParams.set('storeId', activeStoreId);

        fetch(`/api/sellers?${queryParams.toString()}`)
            .then(r => r.json())
            .then(data => {
                if (data.sellers) {
                    setSellers(data.sellers)
                } else {
                    console.error('No sellers found or error:', data.error);
                    setSellers([])
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setLoading(false)
            })
    }, [companyId, searchParams])

    const triggerError = useCallback((msg: string) => {
        setError(msg)
        setShake(true)
        setTimeout(() => {
            setShake(false)
            setPin('')
        }, 700)
    }, [])

    // Auto-submit when 4 digits entered
    useEffect(() => {
        if (pin.length < 4 || !selectedSeller || authenticating) return
        setAuthenticating(true)

        signIn('pin', {
            pin,
            userId: selectedSeller._id,
            redirect: false,
        }).then(result => {
            if (result?.error) {
                setAuthenticating(false)
                triggerError('PIN incorrecto. Inténtalo de nuevo.')
            } else {
                // Redirect to POS after successful login
                router.push(`/admin/pos/${searchParams.get('storeId') || ''}`)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin])

    const handleKeyPress = (digit: string) => {
        if (pin.length >= 4 || authenticating) return
        setError('')
        setPin(prev => prev + digit)
    }

    const handleDelete = () => {
        if (authenticating) return
        setError('')
        setPin(prev => prev.slice(0, -1))
    }

    const handleBack = () => {
        setSelectedSeller(null)
        setPin('')
        setError('')
    }

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    // --- SELLER SELECTION SCREEN ---
    if (!selectedSeller) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
                            <span className="text-white text-2xl font-bold">CF</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">¿Quién eres?</h1>
                        <p className="text-gray-500 text-sm mt-1">Selecciona tu perfil para iniciar turno</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    ) : sellers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-lg">No hay vendedores configurados</p>
                            <p className="text-sm mt-2">El administrador debe agregar vendedores primero.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {sellers.map(seller => (
                                <button
                                    key={seller._id}
                                    onClick={() => seller.hasPin ? setSelectedSeller(seller) : null}
                                    disabled={!seller.hasPin}
                                    className={cn(
                                        'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left w-full',
                                        seller.hasPin
                                            ? 'border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 active:scale-[0.98] shadow-sm cursor-pointer'
                                            : 'border-dashed border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    {seller.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={seller.image} alt={seller.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg flex-shrink-0">
                                            {getInitials(seller.name)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{seller.name}</p>
                                        <p className="text-xs text-gray-400">{seller.hasPin ? 'Tiene PIN configurado' : 'Sin PIN — contacta al admin'}</p>
                                    </div>
                                    {seller.hasPin && (
                                        <div className="text-orange-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Admin login link */}
                    <div className="text-center mt-8">
                        <a href="/sign-in" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                            Iniciar sesión como administrador →
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // --- PIN KEYPAD SCREEN ---
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xs">

                {/* Back button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Cambiar vendedor</span>
                </button>

                {/* Seller avatar */}
                <div className="text-center mb-8">
                    <div className="inline-flex flex-col items-center gap-3">
                        {selectedSeller.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={selectedSeller.image} alt={selectedSeller.name} className="w-20 h-20 rounded-full object-cover shadow-lg" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-3xl shadow-lg">
                                {getInitials(selectedSeller.name)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedSeller.name}</h2>
                            <p className="text-gray-500 text-sm">Ingresa tu PIN de 4 dígitos</p>
                        </div>
                    </div>
                </div>

                {/* PIN dots */}
                <div className={cn(
                    'flex justify-center gap-4 mb-6 transition-all',
                    shake && 'animate-[shake_0.5s_ease-in-out]'
                )}>
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={cn(
                                'w-4 h-4 rounded-full border-2 transition-all duration-150',
                                pin.length > i
                                    ? 'bg-orange-500 border-orange-500 scale-110'
                                    : 'bg-transparent border-gray-300'
                            )}
                        />
                    ))}
                </div>

                {/* Error message */}
                <div className={cn(
                    'text-center text-sm mb-4 transition-all',
                    error ? 'text-red-500 opacity-100' : 'opacity-0'
                )}>
                    {error || ' '}
                </div>

                {/* Authenticating spinner */}
                {authenticating && (
                    <div className="flex justify-center mb-4">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                )}

                {/* Numeric keypad */}
                <div className="grid grid-cols-3 gap-3">
                    {digits.map((digit, index) => {
                        if (digit === '') {
                            return <div key={index} /> // Empty cell
                        }
                        if (digit === 'del') {
                            return (
                                <button
                                    key={index}
                                    onClick={handleDelete}
                                    disabled={authenticating || pin.length === 0}
                                    className="h-16 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:bg-orange-50 active:scale-95 transition-all shadow-sm disabled:opacity-40"
                                >
                                    <Delete className="w-5 h-5" />
                                </button>
                            )
                        }
                        return (
                            <button
                                key={index}
                                onClick={() => handleKeyPress(digit)}
                                disabled={authenticating || pin.length >= 4}
                                className="h-16 rounded-2xl bg-white border-2 border-gray-200 text-2xl font-semibold text-gray-800 hover:border-orange-400 hover:bg-orange-50 active:scale-95 active:bg-orange-100 transition-all shadow-sm disabled:opacity-40"
                            >
                                {digit}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* CSS keyframe for shake animation */}
            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
        </div>
    )
}
