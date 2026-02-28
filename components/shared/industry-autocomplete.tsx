'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronsUpDown, Plus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getIndustrySuggestions, createOrFindIndustry } from '@/lib/actions/industry.actions'
import { useDebounce } from '@/hooks/use-debounce'

interface IndustryOption {
    _id: string
    name: string
    slug: string
}

interface IndustryAutocompleteProps {
    value: string
    onChange: (slug: string, name: string) => void
    placeholder?: string
    'data-testid'?: string
}

export function IndustryAutocomplete({
    value,
    onChange,
    placeholder = 'Selecciona o escribe tu giro...',
    'data-testid': testId,
}: IndustryAutocompleteProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<IndustryOption[]>([])
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const DROPDOWN_HEIGHT = 280
    const [pos, setPos] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null)

    const triggerRef = useRef<HTMLButtonElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const debouncedQuery = useDebounce(query, 300)

    const selectedLabel = suggestions.find(s => s.slug === value)?.name || value || ''

    const computePos = useCallback(() => {
        if (!triggerRef.current) return null
        const r = triggerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - r.bottom
        const openUp = spaceBelow < DROPDOWN_HEIGHT && r.top > DROPDOWN_HEIGHT
        return {
            top: openUp ? r.top - 4 : r.bottom + 4,
            left: Math.max(8, r.left),
            width: Math.min(r.width, window.innerWidth - 16),
            openUp,
        }
    }, [])

    const updatePos = useCallback(() => {
        const p = computePos()
        if (p) setPos(p)
    }, [computePos])

    const handleOpen = () => {
        updatePos()
        setOpen(true)
        setQuery('')
        setTimeout(() => inputRef.current?.focus(), 10)
    }

    const handleClose = () => {
        setOpen(false)
        setQuery('')
    }

    // Load suggestions
    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const res = await getIndustrySuggestions(debouncedQuery)
                if (res.success) setSuggestions(res.suggestions as IndustryOption[])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [debouncedQuery])

    // Close on outside click or scroll
    useEffect(() => {
        if (!open) return
        const handleMouseDown = (e: MouseEvent) => {
            const portal = document.getElementById('industry-ac-portal')
            if (triggerRef.current?.contains(e.target as Node)) return
            if (portal?.contains(e.target as Node)) return
            handleClose()
        }
        document.addEventListener('mousedown', handleMouseDown)
        // Reposition on resize (mobile virtual keyboard changes viewport size)
        window.addEventListener('resize', updatePos)
        return () => {
            document.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('resize', updatePos)
        }
    }, [open, updatePos])

    const handleCreate = async () => {
        if (!query.trim() || creating) return
        setCreating(true)
        try {
            const res = await createOrFindIndustry(query.trim())
            if (res.success) {
                const newOpt: IndustryOption = { _id: res.slug, name: res.name, slug: res.slug }
                setSuggestions(prev => prev.find(s => s.slug === res.slug) ? prev : [newOpt, ...prev])
                onChange(res.slug, res.name)
                handleClose()
            }
        } finally {
            setCreating(false)
        }
    }

    const queryMatchesExisting = query.trim()
        ? suggestions.some(s => s.name.toLowerCase() === query.trim().toLowerCase())
        : true
    const showCreate = query.trim() && !queryMatchesExisting

    // Portal dropdown — position: fixed relative to viewport (no scrollY offset)
    const dropdown = open && pos ? (
        <div
            id="industry-ac-portal"
            style={{
                position: 'fixed',
                ...(pos.openUp
                    ? { bottom: window.innerHeight - pos.top, top: undefined }
                    : { top: pos.top, bottom: undefined }
                ),
                left: pos.left,
                width: pos.width,
                zIndex: 99999,
            }}
            className="rounded-md border border-gray-200 bg-white shadow-xl"
        >
            {/* Search */}
            <div className="flex items-center border-b border-gray-100 px-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Escape') handleClose()
                        if (e.key === 'Enter' && showCreate) { e.preventDefault(); handleCreate() }
                    }}
                    placeholder="Buscar o escribir giro..."
                    className="w-full h-10 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {query && (
                    <button type="button" onMouseDown={e => { e.preventDefault(); setQuery('') }} className="ml-1 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Scrollable list */}
            <ul className="py-1 overflow-y-auto" style={{ maxHeight: '200px' }}>
                {loading ? (
                    <li className="flex items-center justify-center py-3 gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                    </li>
                ) : suggestions.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-muted-foreground">No encontrado.</li>
                ) : (
                    suggestions.map(opt => (
                        <li key={opt.slug}>
                            <button
                                type="button"
                                onMouseDown={e => {
                                    e.preventDefault()
                                    onChange(opt.slug, opt.name)
                                    handleClose()
                                }}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
                                    value === opt.slug && 'bg-orange-50 text-orange-700 font-medium'
                                )}
                            >
                                <Check className={cn('h-4 w-4 shrink-0', value === opt.slug ? 'opacity-100 text-orange' : 'opacity-0')} />
                                {opt.name}
                            </button>
                        </li>
                    ))
                )}
            </ul>

            {/* Create new */}
            {showCreate && (
                <div className="border-t border-gray-100 p-2">
                    <button
                        type="button"
                        disabled={creating}
                        onMouseDown={e => { e.preventDefault(); handleCreate() }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 rounded-md hover:bg-orange-50 font-medium transition-colors"
                    >
                        {creating ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
                        Agregar &quot;{query.trim()}&quot; como nuevo giro
                    </button>
                </div>
            )}
        </div>
    ) : null

    return (
        <div className="w-full" data-testid={testId}>
            <button
                ref={triggerRef}
                type="button"
                onClick={open ? handleClose : handleOpen}
                className={cn(
                    'w-full h-10 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50/30 px-3 text-sm shadow-sm transition-all hover:bg-gray-100/50 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20',
                    !selectedLabel && 'text-muted-foreground'
                )}
            >
                <span className="truncate">{selectedLabel || placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
        </div>
    )
}
