'use client'

import { AttributeDialog } from '@/components/admin/attributes/attribute-dialog'
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
import { IAttribute } from '@/lib/db/models/attribute.model'
import {
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Plus, Search, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { getColumns } from './attribute-column'

interface AttributeClientProps {
    data: IAttribute[]
    storeId: string
}

export function AttributeClient({ data, storeId }: AttributeClientProps) {
    const t = useTranslations('admin.attributes')
    const tCommon = useTranslations('common')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const columns = getColumns(t, tCommon)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-navy">{t('title')}</h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">{t('description')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

                    <AttributeDialog
                        storeId={storeId}
                        trigger={
                            <Button className="bg-orange hover:bg-orange-dark text-white h-9 px-4 flex-1 sm:flex-none">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">{t('addVariant')}</span>
                                <span className="sm:hidden">{tCommon('add')}</span>
                            </Button>
                        }
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center py-4 bg-white p-4 rounded-lg border shadow-sm gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search')}
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <div className="ml-auto">
                    {/* Status filter could go here */}
                </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-gray-50/50">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="font-semibold text-navy py-4">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-4">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-32 text-center text-gray-500"
                                    >
                                        {t('noResults')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
                    {/* Row per page selector could go here */}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {t('previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('next')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
