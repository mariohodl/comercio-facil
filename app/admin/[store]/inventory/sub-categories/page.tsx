'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ISubCategory } from '@/lib/db/models/sub-category.model'
import { getAllSubCategories, deleteSubCategory } from '@/lib/actions/sub-category.actions'
import { SubCategoryModal } from '@/components/shared/sub-category-modal'
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
import Image from 'next/image'

export default function SubCategoriesPage() {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()

    const [subCategories, setSubCategories] = useState<(ISubCategory & { parentCategory: { categoryName: string } })[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSubCategory, setSelectedSubCategory] = useState<ISubCategory | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [subCategoryToDelete, setSubCategoryToDelete] = useState<string | null>(null)

    const fetchSubCategories = async () => {
        setLoading(true)
        try {
            const result = await getAllSubCategories({
                query: searchQuery,
                page: currentPage,
                limit: rowsPerPage,
                status: statusFilter,
            })
            setSubCategories(result.subCategories)
            setTotalPages(result.totalPages)
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

    // Reset to page 1 when rowsPerPage changes
    useEffect(() => {
        setCurrentPage(1)
    }, [rowsPerPage])

    const handleAddSubCategory = () => {
        setSelectedSubCategory(null)
        setModalOpen(true)
    }

    const handleEditSubCategory = (subCategory: ISubCategory) => {
        setSelectedSubCategory(subCategory)
        setModalOpen(true)
    }

    const handleDeleteClick = (subCategoryId: string) => {
        setSubCategoryToDelete(subCategoryId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!subCategoryToDelete) return

        const result = await deleteSubCategory(subCategoryToDelete)
        if (result.success) {
            showSuccess(result.message)
            fetchSubCategories()
        } else {
            showError(result.message)
        }
        setDeleteDialogOpen(false)
        setSubCategoryToDelete(null)
    }

    const handleModalSuccess = () => {
        fetchSubCategories()
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy">{t('subCategories')}</h1>
                    <p className="text-muted-foreground">{t('manageSubCategories')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-red-500">
                        <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-green-600">
                        <FileUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchSubCategories}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={handleAddSubCategory}
                        className="bg-orange hover:bg-orange-dark text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addSubCategory')}
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
                        <SelectValue placeholder="Status" />
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
                            <TableHead>{t('image')}</TableHead>
                            <TableHead>{t('subCategory')}</TableHead>
                            <TableHead>{t('category')}</TableHead>
                            <TableHead>{t('categoryCode')}</TableHead>
                            <TableHead>{t('description')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="text-right">{t('action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    {t('loading')}
                                </TableCell>
                            </TableRow>
                        ) : subCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    {t('noSubCategoriesFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            subCategories.map((subCategory) => (
                                <TableRow key={subCategory._id}>
                                    <TableCell>
                                        {subCategory.image ? (
                                            <div className="relative h-10 w-10">
                                                <Image
                                                    src={subCategory.image}
                                                    alt={subCategory.name}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                                                {t('noImg')}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{subCategory.name}</TableCell>
                                    <TableCell>{subCategory.parentCategory?.categoryName || 'N/A'}</TableCell>
                                    <TableCell>{subCategory.code}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{subCategory.description}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                subCategory.status
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                            }
                                        >
                                            {subCategory.status ? t('active') : t('inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditSubCategory(subCategory)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(subCategory._id)}
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

            {/* Sub Category Modal */}
            <SubCategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                subCategory={selectedSubCategory}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title={t('deleteSubCategoryTitle')}
                description={t('deleteSubCategoryDescription')}
            />
        </div>
    )
}
