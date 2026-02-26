'use client'
import React from 'react'
import useLoadingStore from '@/hooks/use-loading-store'
import Spinner from './Spinner'
import { useTranslations } from 'next-intl'

const GlobalLoader = () => {
    const isLoading = useLoadingStore((state) => state.isLoading)
    const t = useTranslations('common')

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all animate-in fade-in duration-500">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 scale-110 border border-white/20">
                <Spinner size={60} />
                <p className="text-navy font-bold text-lg animate-pulse tracking-tight">
                    {t('processing') || 'Procesando información...'}
                </p>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em]">
                    Comercio Fácil
                </p>
            </div>
        </div>
    )
}

export default GlobalLoader
