'use client'

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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Pencil,
    Trash2,
    Search,
    FileText,
    FileSpreadsheet,
    RotateCcw,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Plus,
    Settings
} from 'lucide-react'
import { format } from 'date-fns'
import { IUnit } from '@/lib/db/models/unit.model'
import { getAllUnits, deleteUnit } from '@/lib/actions/unit.actions'
import { UnitModal } from '@/components/shared/unit-modal'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { useToast } from '@/hooks/use-toast'

export default function UnitList() {
    const { showSuccess, showError } = useToast()
    const [units, setUnits] = useState<IUnit[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('latest')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUnits, setTotalUnits] = useState(0)
    const [limit] = useState(10)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUnit, setSelectedUnit] = useState<IUnit | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null)

    const fetchUnits = async () => {
        setLoading(true)
        try {
            const result = await getAllUnits({
                query: searchTerm,
                page,
                limit,
                status: statusFilter,
                sort: sortBy,
            })
            setUnits(result.units)
            setTotalPages(result.totalPages)
            setTotalUnits(result.totalUnits)
        } catch (error) {
            console.error('Error fetching units:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUnits()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, page, statusFilter, sortBy])

    const handleEdit = (unit: IUnit) => {
        setSelectedUnit(unit)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setUnitToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!unitToDelete) return

        try {
            const result = await deleteUnit(unitToDelete)
            if (result.success) {
                showSuccess(result.message)
                fetchUnits()
            } else {
                showError(result.message)
            }
        } catch (error) {
            showError('Error deleting unit')
        } finally {
            setIsDeleteDialogOpen(false)
            setUnitToDelete(null)
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedUnit(null)
    }

    const handleModalSuccess = () => {
        fetchUnits()
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Units</h2>
                    <p className="text-muted-foreground">Manage your units</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <FileText className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => fetchUnits()}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button className="bg-orange hover:bg-orange-dark text-white" onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Unit
                    </Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search"
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">Sort By : Latest</SelectItem>
                                <SelectItem value="oldest">Sort By : Oldest</SelectItem>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Abbreviation</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : units.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No units found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                units.map((unit) => (
                                    <TableRow key={unit._id}>
                                        <TableCell>
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{unit.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{unit.abbreviation}</span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(unit.createdAt), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={unit.status ? 'default' : 'secondary'}
                                                className={unit.status ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}
                                            >
                                                {unit.status ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 border rounded-md"
                                                    onClick={() => handleEdit(unit)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 border rounded-md"
                                                    onClick={() => handleDeleteClick(unit._id)}
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
                        <span>Row Per Page</span>
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
                        <span>Entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {units.length > 0 ? 1 : 0} - {units.length} of {totalUnits} items
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

            <UnitModal
                open={isModalOpen}
                onClose={handleModalClose}
                unit={selectedUnit}
                onSuccess={handleModalSuccess}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Unit"
                description="Are you sure you want to delete this unit? This action cannot be undone."
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
