'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ISubCategory } from '@/lib/db/models/sub-category.model'
import { getAllSubCategories, deleteSubCategory } from '@/lib/actions/sub-category.actions'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getActiveCategories } from '@/lib/actions/category.actions'
import { ICategory } from '@/lib/db/models/category.model'
import { SuggestedSubCategoriesDialog } from '@/components/shared/suggested-sub-categories-dialog'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { SubCategoryModal } from '@/components/shared/sub-category-modal'


import { useParams } from 'next/navigation'

export default function SubCategoriesPage() {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showError, showSuccess } = useToast()
    const { store } = useParams<{ store: string }>()

    const [subCategories, setSubCategories] = useState<(ISubCategory & { parentCategory: { categoryName: string } })[]>([])
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(1000)

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSubCategory, setSelectedSubCategory] = useState<ISubCategory | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [subCategoryToDelete, setSubCategoryToDelete] = useState<string | null>(null)

    // AI Suggestions State Sectioon
    const [categories, setCategories] = useState<ICategory[]>([])
    const [aiSelectionOpen, setAiSelectionOpen] = useState(false)
    const [selectedParentForAi, setSelectedParentForAi] = useState<{ id: string, name: string } | null>(null)
    const [loadingCategories, setLoadingCategories] = useState(false)

    const fetchSubCategories = async () => {
        setLoading(true)
        try {
            const result = await getAllSubCategories({
                query: searchQuery,
                page: currentPage,
                limit: rowsPerPage,
                status: statusFilter,
                storeId: store,
            })
            setSubCategories(result.subCategories)
        } catch {
            showError('Failed to fetch sub categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, statusFilter, currentPage, rowsPerPage])

    // Reset to page 1 when searchQuery or statusFilter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter])

    const handleAddSubCategory = () => {
        setSelectedSubCategory(null)
        setModalOpen(true)
    }

    const handleEditSubCategory = (subCategory: any) => {
        setSelectedSubCategory(subCategory)
        setModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setSubCategoryToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!subCategoryToDelete) return
        const res = await deleteSubCategory(subCategoryToDelete)
        if (res.success) {
            showSuccess(res.message)
            fetchSubCategories()
        } else {
            showError(res.message)
        }
        setDeleteDialogOpen(false)
        setSubCategoryToDelete(null)
    }

    const handleOpenAiSelection = async () => {
        setAiSelectionOpen(true)
        setLoadingCategories(true)
        try {
            const cats = await getActiveCategories(store)
            setCategories(cats)
        } catch {
            showError('Failed to fetch categories')
        } finally {
            setLoadingCategories(false)
        }
    }

    const handleAiCategorySelect = (categoryId: string) => {
        const cat = categories.find(c => c._id === categoryId)
        if (cat) {
            setSelectedParentForAi({ id: cat._id, name: cat.categoryName })
            setAiSelectionOpen(false)
        }
    }

    return (
        <div className="space-y-6 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-navy tracking-tight">{t('subCategories')}</h1>
                    <p className="text-sm md:text-md text-slate-500 font-medium">{t('manageSubCategories')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

                    <Button
                        variant="outline"
                        onClick={handleOpenAiSelection}
                        className="bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 font-bold shadow-sm"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Suggestions
                    </Button>
                    <Button
                        onClick={handleAddSubCategory}
                        className="bg-orange hover:bg-orange-dark text-white font-bold flex-1 sm:flex-none shadow-lg shadow-orange-500/20 active:scale-95 transition-all h-9"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addSubCategory') || 'Add Sub Category'}
                    </Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder={tCommon('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px] h-11 bg-slate-50/50 border-slate-100 rounded-xl">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allStatus')}</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="inactive">{t('inactive')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="border rounded-2xl bg-white overflow-hidden shadow-sm border-slate-100">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="min-w-[150px]">{t('subCategory')}</TableHead>
                                <TableHead className="min-w-[150px]">{t('category')}</TableHead>
                                <TableHead className="min-w-[120px]">{t('categoryCode')}</TableHead>
                                <TableHead>{t('type') || 'Type'}</TableHead>
                                <TableHead>{t('approval')}</TableHead>
                                <TableHead className="w-[100px]">{t('status')}</TableHead>
                                <TableHead className="text-right w-[100px]">{t('action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('loading')}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : subCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                                        {t('noSubCategoriesFound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subCategories.map((subCategory) => (
                                    <TableRow key={subCategory._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="font-bold text-navy">{subCategory.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold bg-blue-50/50 text-blue-600 border-blue-100 px-2.5 py-0.5 rounded-lg">
                                                {subCategory.parentCategory?.categoryName || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                                                {subCategory.code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {subCategory.isGlobal ? (
                                                <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold px-2 py-0.5 rounded-lg">Global</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold px-2 py-0.5 rounded-lg">Custom</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "font-bold px-2.5 py-0.5 rounded-lg",
                                                    subCategory.isApproved
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                )}
                                            >
                                                {subCategory.isApproved ? t('approved') : t('pending')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "font-bold px-2.5 py-0.5 rounded-lg",
                                                    subCategory.status
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-100'
                                                )}
                                            >
                                                {subCategory.status ? t('active') : t('inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-8 w-8 rounded-lg",
                                                        subCategory.isApproved
                                                            ? "text-slate-200 cursor-not-allowed"
                                                            : "text-slate-400 hover:text-navy hover:bg-slate-100"
                                                    )}
                                                    onClick={() => handleEditSubCategory(subCategory)}
                                                    disabled={subCategory.isApproved}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-8 w-8 rounded-lg",
                                                        subCategory.isApproved
                                                            ? "text-slate-200 cursor-not-allowed"
                                                            : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                    )}
                                                    onClick={() => handleDeleteClick(subCategory._id)}
                                                    disabled={subCategory.isApproved}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>


            <SubCategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                subCategory={selectedSubCategory}
                onSuccess={fetchSubCategories}
                storeId={store}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Sub Category"
                description="Are you sure you want to delete this sub category? This action cannot be undone."
            />

            <Dialog open={aiSelectionOpen} onOpenChange={setAiSelectionOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Select Category</DialogTitle>
                        <DialogDescription>
                            Choose a category to generate subcategory suggestions for.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {loadingCategories ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                            </div>
                        ) : (
                            <Select onValueChange={handleAiCategorySelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {selectedParentForAi && (
                <SuggestedSubCategoriesDialog
                    open={!!selectedParentForAi}
                    onOpenChange={(open) => {
                        if (!open) setSelectedParentForAi(null)
                    }}
                    categoryName={selectedParentForAi.name}
                    categoryId={selectedParentForAi.id}
                    storeId={store}
                    onSuccess={fetchSubCategories}
                />
            )}
        </div>
    )
}
