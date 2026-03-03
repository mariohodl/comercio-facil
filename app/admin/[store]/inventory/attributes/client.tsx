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
                        disabled={data.length === 0}
                    />
                </div>
                <div className="ml-auto">
                    {/* Status filter could go here */}
                </div>
            </div>

            {/* Handle Truly Empty State (no data at all) */}
            {data.length === 0 && !globalFilter ? (
                <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto">
                        <div className="bg-orange/10 p-5 rounded-full shadow-inner animate-pulse">
                            <Plus className="h-12 w-12 text-orange" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl font-bold text-navy">{t('emptyTitle')}</h3>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed px-4">
                                {t('emptyDescription')}
                            </p>
                        </div>
                        <AttributeDialog
                            storeId={storeId}
                            trigger={
                                <Button className="bg-orange hover:bg-orange-dark text-white px-8 py-6 text-lg shadow-lg hover:shadow-orange/20 transition-all rounded-xl w-full sm:w-auto">
                                    <Plus className="mr-2 h-5 w-5" />
                                    {t('emptyCTA')}
                                </Button>
                            }
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <Table className="min-w-full">
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
                                                className="h-40 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="bg-slate-100 p-3 rounded-full">
                                                        <Search className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium px-4">{t('noResults')}</p>
                                                </div>
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
                </>
            )}
        </div>
    )
}
