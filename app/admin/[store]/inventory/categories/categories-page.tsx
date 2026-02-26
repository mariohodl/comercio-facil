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
                showSuccess(`Catalog seeded: ${res.results?.categories} categories added`)
                fetchCategories()
            } else {
                showError(res.error || 'Failed to seed catalog')
            }
        } catch (error) {
            showError('Something went wrong')
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
            showError('Failed to fetch categories')
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
                            {t('setupCatalog') || 'Setup Catalog'}
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
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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

            {/* Table */}
            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('category')}</TableHead>
                            <TableHead>{t('categorySlug')}</TableHead>
                            <TableHead>{t('type') || 'Type'}</TableHead>
                            <TableHead>{tCommon('createdDate')}</TableHead>
                            <TableHead>{t('approval')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="text-right">{t('action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    {t('loading')}
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    {t('noCategoriesFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category._id}>
                                    <TableCell className="font-medium">
                                        <div className='flex items-center gap-2'>
                                            {category.categoryName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {category.categorySlug}
                                    </TableCell>
                                    <TableCell>
                                        {category.isGlobal ? (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Global</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Custom</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                category.isApproved
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                            }
                                        >
                                            {category.isApproved ? t('approved') : t('pending')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                category.status
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                            }
                                        >
                                            {category.status ? t('active') : t('inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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
