'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getCategorySuggestions, getBrandSuggestions, getSubCategorySuggestions, getUnitSuggestions } from '@/lib/actions/catalog.actions'
import { useDebounce } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface Option {
    _id: string
    name: string
    isGlobal?: boolean
    abbreviation?: string
}

interface CatalogAutocompleteProps {
    value: string
    onSelect: (option: Option | null) => void
    onCustomCreate?: (name: string) => void
    initialOptions?: Option[]
    placeholder?: string
    industry?: string
    mode?: 'category' | 'brand' | 'subCategory' | 'unit'
    categoryId?: string
    storeId?: string
    'data-testid'?: string
}

export function CatalogAutocomplete({
    value,
    onSelect,
    onCustomCreate,
    initialOptions = [],
    placeholder = "Select...",
    industry = 'general',
    mode = 'category',
    categoryId,
    storeId,
    'data-testid': testId,
}: CatalogAutocompleteProps) {
    const { showSuccess } = useToast()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<Option[]>(initialOptions)
    const [loading, setLoading] = useState(false)
    const debouncedQuery = useDebounce(query, 300)

    const tCommon = useTranslations('common')
    const tInventory = useTranslations('inventory')
    const tProducts = useTranslations('products')

    const getModeLabel = (m: string) => {
        switch (m) {
            case 'category': return tInventory('category') || 'Category';
            case 'brand': return tInventory('brand') || 'Brand';
            case 'subCategory': return tInventory('subCategory') || 'Subcategory';
            case 'unit': return tProducts('unit') || 'Unit';
            default: return m;
        }
    };

    const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Initially sync suggestions with initialOptions
    useEffect(() => {
        if (!query) {
            setSuggestions(initialOptions)
        }
    }, [initialOptions, query])

    useEffect(() => {
        const fetchSuggestions = async () => {
            // Local filtering of initialOptions
            const localResults = initialOptions.filter(opt =>
                normalize(opt.name).includes(normalize(debouncedQuery))
            )

            // Perform server fetch
            setLoading(true)
            try {
                let res: any;
                switch (mode) {
                    case 'category':
                        res = await getCategorySuggestions(debouncedQuery, industry, storeId);
                        break;
                    case 'brand':
                        res = await getBrandSuggestions(debouncedQuery, industry, storeId);
                        break;
                    case 'subCategory':
                        res = await getSubCategorySuggestions(debouncedQuery, categoryId, industry, storeId);
                        break;
                    case 'unit':
                        res = await getUnitSuggestions(debouncedQuery, industry, storeId);
                        break;
                    default:
                        res = { success: false };
                }

                if (res.success && res.suggestions) {
                    const globalMapped = res.suggestions.map((s: any) => ({
                        _id: (s._id || s.id || Math.random().toString()).toString(),
                        name: mode === 'category' ? (s.categoryName || s.name) : s.name,
                        isGlobal: s.isGlobal,
                        abbreviation: s.abbreviation
                    }))

                    // Merge local and global
                    const combined = [...localResults, ...globalMapped]

                    // Deduplicate by Name to prevent cmdk/React key errors
                    const unique = combined.filter((v, i, a) =>
                        a.findIndex(t => t.name.toLowerCase() === v.name.toLowerCase()) === i
                    )
                    setSuggestions(unique)
                } else {
                    setSuggestions(localResults)
                }
            } catch (err) {
                console.error(err)
                setSuggestions(localResults)
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestions()
    }, [debouncedQuery, industry, mode, initialOptions, categoryId, storeId])

    const selectedOption = useMemo(() => {
        return suggestions.find((s) => s.name === value)
    }, [suggestions, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10"
                    data-testid={testId}
                >
                    <span className="truncate">
                        {value ? value : (placeholder === "Select..." ? tProducts('select') : placeholder)}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] pointer-events-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={tCommon('searchPlaceholder', { item: getModeLabel(mode) })}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty className="p-2">
                            {loading ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span>{tCommon('searching')}</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        {tInventory('noItemFound', { item: getModeLabel(mode) })}
                                    </p>
                                    {onCustomCreate && (
                                        <div className="w-full">
                                            {mode === 'subCategory' && !categoryId ? (
                                                <p className="text-xs text-muted-foreground italic mt-2">
                                                    {tInventory('selectCategoryFirst')}
                                                </p>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full justify-start mt-2"
                                                    onClick={() => {
                                                        onCustomCreate(query)
                                                        showSuccess(tInventory('itemCreated', {
                                                            item: getModeLabel(mode),
                                                            name: query
                                                        }))
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {tInventory('createNew', { name: query })}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {suggestions.map((option) => (
                                <CommandItem
                                    key={option._id}
                                    value={option.name}
                                    onSelect={() => {
                                        onSelect(option)
                                        setOpen(false)
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onSelect(option)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span>{option.name}</span>
                                    {option.abbreviation && (
                                        <span className="ml-1 text-muted-foreground">
                                            ({option.abbreviation})
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
