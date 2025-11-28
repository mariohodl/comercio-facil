'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { ICategory } from '@/lib/db/models/category.model'
import { getAllCategories, deleteCategory } from '@/lib/actions/category.actions'
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
import { Search, Plus, Edit, Trash2, FileDown, FileUp, RefreshCw } from 'lucide-react'
import { DeleteDialog } from '@/components/shared/delete-dialog'

export default function CategoriesPage() {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()

    const [categories, setCategories] = useState<ICategory[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const result = await getAllCategories({
                query: searchQuery,
                page: currentPage,
                limit: rowsPerPage,
                status: statusFilter,
            })
            setCategories(result.categories)
            setTotalPages(result.totalPages)
        } catch {
            showError('Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, statusFilter, currentPage, rowsPerPage])

    // Reset to page 1 when rowsPerPage changes
    useEffect(() => {
        setCurrentPage(1)
    }, [rowsPerPage])

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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy">{t('categories')}</h1>
                    <p className="text-muted-foreground">{t('manageCategories')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-red-500">
                        <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-green-600">
                        <FileUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchCategories}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={handleAddCategory}
                        className="bg-orange hover:bg-orange-dark text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addCategory')}
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={tCommon('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
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
                            <TableHead>{tCommon('createdDate')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="text-right">{t('action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    {t('loading')}
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    {t('noCategoriesFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category._id}>
                                    <TableCell className="font-medium">{category.categoryName}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {category.categorySlug}
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
                                                onClick={() => handleEditCategory(category)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(category._id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{tCommon('rowsPerPage')}</span>
                    <Select
                        value={String(rowsPerPage)}
                        onValueChange={(value) => setRowsPerPage(Number(value))}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">{tCommon('entries')}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        {tCommon('previous')}
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={
                                    currentPage === page
                                        ? 'bg-orange hover:bg-orange-dark text-white'
                                        : ''
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        {tCommon('next')}
                    </Button>
                </div>
            </div>


            {/* Category Modal */}
            <CategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                category={selectedCategory}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Dialog */}
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
