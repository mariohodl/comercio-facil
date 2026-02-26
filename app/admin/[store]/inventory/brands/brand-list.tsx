'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Settings,
    Pencil,
    Trash2,
    Search,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { IBrand } from '@/lib/db/models/brand.model'
import { getAllBrands, deleteBrand } from '@/lib/actions/brand.actions'
import { BrandModal } from '@/components/shared/brand-modal'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { useToast } from '@/hooks/use-toast'

export default function BrandList({ store }: { store: string }) {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const [brands, setBrands] = useState<IBrand[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('latest')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalBrands, setTotalBrands] = useState(0)
    const [limit] = useState(10)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [brandToDelete, setBrandToDelete] = useState<string | null>(null)

    const fetchBrands = async () => {
        setLoading(true)
        try {
            const result = await getAllBrands({
                query: searchTerm,
                page,
                limit,
                status: statusFilter,
                sort: sortBy,
                storeId: store,
            })
            setBrands(result.brands)
            setTotalPages(result.totalPages)
            setTotalBrands(result.totalBrands)
        } catch (error) {
            console.error('Error fetching brands:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBrands()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, page, statusFilter, sortBy])

    const handleEdit = (brand: IBrand) => {
        setSelectedBrand(brand)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setBrandToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!brandToDelete) return

        try {
            const result = await deleteBrand(brandToDelete)
            if (result.success) {
                showSuccess(t('brandDeleted'))
                fetchBrands()
            } else {
                showError(result.message)
            }
        } catch (error) {
            showError('Error deleting brand')
        } finally {
            setIsDeleteDialogOpen(false)
            setBrandToDelete(null)
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedBrand(null)
    }

    const handleModalSuccess = () => {
        fetchBrands()
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">{t('brands')}</h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">{t('manageBrands')}</p>
                </div>
                <div className="flex gap-2">

                    <Button className="bg-orange hover:bg-orange-dark text-white" onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> {t('addBrand')}
                    </Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={tCommon('search')}
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder={t('status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('status')}</SelectItem>
                                <SelectItem value="active">{t('active')}</SelectItem>
                                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder={tCommon('sortBy')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">{tCommon('latest')}</SelectItem>
                                <SelectItem value="oldest">{tCommon('oldest')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox />
                                </TableHead>
                                <TableHead>{t('brand')}</TableHead>
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
                            ) : brands.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        {t('noBrandsFound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands.map((brand) => (
                                    <TableRow key={brand._id}>
                                        <TableCell>
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{brand.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(brand.createdAt), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={brand.status ? 'default' : 'secondary'}
                                                className={brand.status ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}
                                            >
                                                {brand.status ? t('active') : t('inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 border rounded-md"
                                                    onClick={() => handleEdit(brand)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 border rounded-md"
                                                    onClick={() => handleDeleteClick(brand._id)}
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

                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{tCommon('rowsPerPage')}</span>
                        <Select value={limit.toString()} disabled>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={limit.toString()} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>{tCommon('entries')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {brands.length > 0 ? 1 : 0} - {brands.length} {tCommon('of')} {totalBrands} {tCommon('items')}
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 bg-orange hover:bg-orange-dark"
                            >
                                {page}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <BrandModal
                open={isModalOpen}
                onClose={handleModalClose}
                brand={selectedBrand}
                onSuccess={handleModalSuccess}
                storeId={store}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title={t('deleteBrandTitle')}
                description={t('deleteBrandDescription')}
            />

            {/* Settings Float Button */}
            <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
                <Button className="bg-orange hover:bg-orange-dark text-white rounded-l-md rounded-r-none h-10 w-10 p-0 shadow-lg">
                    <Settings className="h-5 w-5 animate-spin-slow" />
                </Button>
            </div>
        </div>
    )
}
