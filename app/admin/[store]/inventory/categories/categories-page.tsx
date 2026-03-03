'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { ICategory } from '@/lib/db/models/category.model'
import { getAllCategories, deleteCategory } from '@/lib/actions/category.actions'
import { seedGlobalCatalog } from '@/lib/actions/catalog.actions'
import { cn } from '@/lib/utils'
import { CategoryModal } from '@/components/shared/category-modal'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Search, Plus, Edit, Trash2, Database, Loader2 } from 'lucide-react'
import { DeleteDialog } from '@/components/shared/delete-dialog'

export default function CategoriesPage({
    params,
}: {
    params: {
        store: string
    }
}) {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const { store } = params

    const [categories, setCategories] = useState<ICategory[]>([])
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(1000)

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
    const [isSeeding, setIsSeeding] = useState(false)

    const handleSeedCatalog = async () => {
        setIsSeeding(true)
        try {
            const res = await seedGlobalCatalog()
            if (res.success) {
                showSuccess(t('catalogSeeded', { count: res.results?.categories }))
                fetchCategories()
            } else {
                showError(t('seedFailed'))
            }
        } catch (error) {
            showError(tCommon('error'))
        } finally {
            setIsSeeding(false)
        }
    }

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const result = await getAllCategories({
                query: searchQuery,
                page: currentPage,
                limit: rowsPerPage,
                status: statusFilter,
                storeId: store,
            })
            setCategories(result.categories)
        } catch {
            showError(t('fetchCategoriesError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (store) {
            fetchCategories()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, statusFilter, currentPage, rowsPerPage, store])

    // Reset to page 1 when searchQuery or statusFilter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter])

    const handleAddCategory = () => {
        setSelectedCategory(null)
        setModalOpen(true)
    }

    const handleEditCategory = (category: ICategory) => {
        setSelectedCategory(category)
        setModalOpen(true)
    }

    const handleDeleteClick = (categoryId: string) => {
        setCategoryToDelete(categoryId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return

        const result = await deleteCategory(categoryToDelete)
        if (result.success) {
            showSuccess(result.message)
            fetchCategories()
        } else {
            showError(result.message)
        }
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
    }

    const handleModalSuccess = () => {
        fetchCategories()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-navy tracking-tight">{t('categories')}</h1>
                    <p className="text-sm md:text-md text-slate-500 font-medium">{t('manageCategories')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">


                    {process.env.NODE_ENV !== 'production' && (
                        <Button
                            variant="outline"
                            onClick={handleSeedCatalog}
                            disabled={isSeeding}
                            className="border-navy text-navy font-bold hover:bg-navy hover:text-white transition-all shadow-md"
                        >
                            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                            {t('setupCatalog')}
                        </Button>
                    )}
                    <Button
                        onClick={handleAddCategory}
                        className="bg-orange hover:bg-orange-dark text-white font-bold flex-1 sm:flex-none shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addCategory')}
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
                        disabled={categories.length === 0 && searchQuery === ''}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter} disabled={categories.length === 0 && searchQuery === ''}>
                    <SelectTrigger className="w-full md:w-[200px] h-11 bg-slate-50/50 border-slate-100 rounded-xl">
                        <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allStatus')}</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="inactive">{t('inactive')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content Section */}
            {!loading && categories.length === 0 && !searchQuery ? (
                <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto">
                        <div className="bg-orange/10 p-5 rounded-full shadow-inner animate-pulse">
                            <Plus className="h-12 w-12 text-orange" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl font-bold text-navy">{t('emptyCategoriesTitle')}</h3>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed px-4">
                                {t('emptyCategoriesDescription')}
                            </p>
                        </div>
                        <Button
                            onClick={handleAddCategory}
                            className="bg-orange hover:bg-orange-dark text-white px-8 py-6 text-lg shadow-lg hover:shadow-orange/20 transition-all rounded-xl w-full sm:w-auto"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            {t('emptyCategoriesCTA')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="font-semibold text-navy py-4">{t('category')}</TableHead>
                                    <TableHead className="hidden md:table-cell font-semibold text-navy py-4">{t('categorySlug')}</TableHead>
                                    <TableHead className="hidden sm:table-cell font-semibold text-navy py-4">{t('type')}</TableHead>
                                    <TableHead className="hidden lg:table-cell font-semibold text-navy py-4">{tCommon('createdDate')}</TableHead>
                                    <TableHead className="hidden sm:table-cell font-semibold text-navy py-4">{t('approval')}</TableHead>
                                    <TableHead className="font-semibold text-navy py-4">{t('status')}</TableHead>
                                    <TableHead className="text-right font-semibold text-navy py-4">{t('action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-orange" />
                                                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">{t('loading')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="bg-slate-100 p-3 rounded-full">
                                                    <Search className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium px-4">{t('noCategoriesFound')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category._id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-bold text-navy">
                                                {category.categoryName}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {category.categorySlug}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {category.isGlobal ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t('global')}</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">{t('custom')}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-slate-500">
                                                {new Date(category.createdAt).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge
                                                    className={cn(
                                                        "font-semibold",
                                                        category.isApproved
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                                    )}
                                                >
                                                    {category.isApproved ? t('approved') : t('pending')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "font-semibold",
                                                        category.status
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                                    )}
                                                >
                                                    {category.status ? t('active') : t('inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-8 w-8 rounded-lg",
                                                            category.isApproved
                                                                ? "text-slate-200 cursor-not-allowed"
                                                                : "text-slate-400 hover:text-navy hover:bg-slate-100"
                                                        )}
                                                        onClick={() => handleEditCategory(category)}
                                                        disabled={category.isApproved}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-8 w-8 rounded-lg",
                                                            category.isApproved
                                                                ? "text-slate-200 cursor-not-allowed"
                                                                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                        )}
                                                        onClick={() => handleDeleteClick(category._id)}
                                                        disabled={category.isApproved}
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
            )}


            <CategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                category={selectedCategory}
                onSuccess={handleModalSuccess}
                storeId={store}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title={t('deleteCategoryTitle')}
                description={t('deleteCategoryDescription')}
            />
        </div>
    )
}
