'use client'

import { Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
    content: string
    className?: string
}

export const HelpTooltip = ({ content, className }: HelpTooltipProps) => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setOpen(false)
            }, 6000)

            return () => clearTimeout(timer)
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center justify-center p-0.5 text-gray-400 hover:text-orange transition-colors focus:outline-none",
                        className
                    )}
                >
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">Help</span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="center"
                className="w-72 p-3 text-xs bg-white border-neutral-200 shadow-lg animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex gap-2">
                    <Info className="h-4 w-4 text-orange shrink-0 mt-0.5" />
                    <p className="text-gray-600 leading-relaxed font-normal">
                        {content}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    )
}
