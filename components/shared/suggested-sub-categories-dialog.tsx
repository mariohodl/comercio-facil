'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Plus, Sparkles } from 'lucide-react'
import { getSuggestedSubCategories } from '@/lib/actions/ai.actions'
import { createSubCategory } from '@/lib/actions/sub-category.actions'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SuggestedSubCategoriesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryName: string
    categoryId: string
    storeId: string
    onSuccess?: () => void
}

export function SuggestedSubCategoriesDialog({
    open,
    onOpenChange,
    categoryName,
    categoryId,
    storeId,
    onSuccess,
}: SuggestedSubCategoriesDialogProps) {
    const { showSuccess, showError } = useToast()
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open && categoryName) {
            fetchSuggestions()
        } else {
            setSuggestions([])
            setSelected([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, categoryName])

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const results = await getSuggestedSubCategories(categoryName)
            setSuggestions(results)
            setSelected([])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (idx: string) => {
        setSelected(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        )
    }

    const handleSave = async () => {
        if (selected.length === 0) {
            onOpenChange(false)
            return
        }

        setSaving(true)
        let successCount = 0

        for (const name of selected) {
            try {
                const res = await createSubCategory({
                    name,
                    slug: '',
                    code: '',
                    parentCategory: categoryId,
                    storeId,
                    status: true
                })
                if (res.success) successCount++
            } catch (e) {
                console.error(`Failed to add ${name}`, e)
            }
        }

        setSaving(false)
        if (successCount > 0) {
            showSuccess(`Added ${successCount} subcategories successfully`)
            onSuccess?.()
        } else {
            showError('Failed to add subcategories')
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !saving && onOpenChange(val)}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-orange-600">
                        <Sparkles className="h-5 w-5" />
                        <DialogTitle>AI Suggested Subcategories</DialogTitle>
                    </div>
                    <DialogDescription>
                        Based on <strong>{categoryName}</strong>, here are some suggested subcategories.
                        Select the ones you want to add.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                            <p className="text-sm font-medium">Generating suggestions...</p>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => {
                                const isSelected = selected.includes(suggestion)
                                return (
                                    <Badge
                                        key={suggestion}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer px-3 py-1.5 text-sm transition-all border-2 select-none",
                                            isSelected
                                                ? "bg-orange-50 border-orange-500 text-orange-700"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-orange-200 hover:text-orange-600"
                                        )}
                                        onClick={() => toggleSelection(suggestion)}
                                    >
                                        {isSelected && <Check className="w-3.5 h-3.5 mr-1.5" />}
                                        {suggestion}
                                    </Badge>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            No suggestions found. You can try again or skip.
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center sm:justify-between w-full gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        Skip
                    </Button>
                    <div className="flex gap-2">
                        {!loading && suggestions.length === 0 && (
                            <Button variant="outline" onClick={fetchSuggestions} disabled={saving}>
                                Try Again
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={loading || saving || selected.length === 0}
                            className="bg-orange hover:bg-orange-dark text-white min-w-[140px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Selected ({selected.length})
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
