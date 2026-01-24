'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ISubCategory } from '@/lib/db/models/sub-category.model'
import { getAllSubCategories, deleteSubCategory } from '@/lib/actions/sub-category.actions'
import { SubCategoryModal } from '@/components/shared/sub-category-modal'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

import { useParams } from 'next/navigation'

export default function SubCategoriesPage() {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const { store } = useParams<{ store: string }>()

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
                storeId: store,
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
        <div className="space-y-6 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy">{t('subCategories')}</h1>
                    <p className="text-sm text-muted-foreground">{t('manageSubCategories')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mr-auto sm:mr-0">
                        <Button variant="outline" size="icon" className="text-red-500 h-9 w-9">
                            <FileDown className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-green-600 h-9 w-9">
                            <FileUp className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={fetchSubCategories} className="h-9 w-9">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        onClick={handleAddSubCategory}
                        className="bg-orange hover:bg-orange-dark text-white h-9 px-4 flex-1 sm:flex-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t('addSubCategory')}</span>
                        <span className="sm:hidden">{tCommon('add')}</span>
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={tCommon('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
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
            <div className="border rounded-lg bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[80px]">{t('image')}</TableHead>
                                <TableHead className="min-w-[150px]">{t('subCategory')}</TableHead>
                                <TableHead className="min-w-[150px]">{t('category')}</TableHead>
                                <TableHead className="min-w-[120px]">{t('categoryCode')}</TableHead>
                                <TableHead className="min-w-[200px]">{t('description')}</TableHead>
                                <TableHead className="w-[100px]">{t('status')}</TableHead>
                                <TableHead className="text-right w-[100px]">{t('action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                                            <span className="text-sm text-gray-500">{t('loading')}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : subCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                        {t('noSubCategoriesFound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subCategories.map((subCategory) => (
                                    <TableRow key={subCategory._id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            {subCategory.image ? (
                                                <div className="relative h-10 w-10 border rounded-md overflow-hidden bg-gray-50">
                                                    <Image
                                                        src={subCategory.image}
                                                        alt={subCategory.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 bg-gray-50 border rounded-md flex items-center justify-center text-[10px] text-gray-400 font-medium">
                                                    {t('noImg')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-navy">{subCategory.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal bg-blue-50/30 text-blue-700 border-blue-100">
                                                {subCategory.parentCategory?.categoryName || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                {subCategory.code}
                                            </code>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <p className="text-sm text-gray-600 truncate" title={subCategory.description}>
                                                {subCategory.description || '-'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "font-medium",
                                                    subCategory.status
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
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
                                                    className="h-8 w-8 text-navy hover:text-orange hover:bg-orange-50"
                                                    onClick={() => handleEditSubCategory(subCategory)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(subCategory._id)}
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{tCommon('rowsPerPage')}</span>
                    <Select
                        value={String(rowsPerPage)}
                        onValueChange={(value) => setRowsPerPage(Number(value))}
                    >
                        <SelectTrigger className="w-[70px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{tCommon('entries')}</span>
                </div>

                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        {tCommon('previous')}
                    </Button>
                    <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-none no-scrollbar">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "h-9 w-9 p-0 font-medium transition-all",
                                    currentPage === page
                                        ? 'bg-orange hover:bg-orange-dark text-white'
                                        : 'hover:bg-gray-100'
                                )}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
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
                storeId={store}
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
