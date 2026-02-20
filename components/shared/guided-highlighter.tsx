'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuidedHighlighterProps {
    children: React.ReactNode
    show: boolean
    message?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    className?: string
}

export default function GuidedHighlighter({
    children,
    show,
    message,
    position = 'top',
    className
}: GuidedHighlighterProps) {
    if (!show) return <>{children}</>

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        // Use a safer left alignment for bottom to avoid sidebar clipping
        bottom: 'top-full left-0 right-0 mt-2 flex justify-center',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    }

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-orange-500',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-orange-500',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-orange-500',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-orange-500',
    }

    return (
        <div className={cn("relative inline-flex items-center", className)}>
            {/* Pulsing Highlight Ring */}
            <div className="absolute -inset-1 rounded-lg bg-orange-500/30 animate-pulse ring-4 ring-orange-500/10" />

            {/* The actual element */}
            <div className="relative z-10 flex items-center w-full">
                {children}
            </div>

            {/* Tooltip/Badge */}
            {message && (
                <div className={cn(`absolute z-[100] animate-in fade-in slide-in-from-bottom-2 duration-500 pointer-events-none`, positionClasses[position])}>
                    <div className="bg-orange-600 text-white text-[11px] font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-orange-400/50 relative max-w-[200px] sm:max-w-[240px]">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-orange-200 shrink-0" />
                        <span className="leading-tight">{message}</span>
                        <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`} />
                    </div>
                </div>
            )}
        </div>
    )
}
