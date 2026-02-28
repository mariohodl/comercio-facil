'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
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
import { Plus, Search, Trash2 } from 'lucide-react'
import { getExpenses, deleteExpense } from '@/lib/actions/expense.actions'
import ExpenseModal from './expense-modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import Pagination from '@/components/shared/pagination'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface ExpenseListProps {
    storeId: string
    initialData: any
}

export default function ExpenseList({ storeId, initialData }: ExpenseListProps) {
    const t = useTranslations('admin.expenses')
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [data, setData] = React.useState(initialData)
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const page = Number(searchParams.get('page')) || 1
    const query = searchParams.get('query') || ''

    const refreshData = async () => {
        const res = await getExpenses({ storeId, page, query })
        setData(res)
    }

    React.useEffect(() => {
        refreshData()
    }, [page, query, storeId])

    const handleDelete = async (id: string) => {
        if (window.confirm(t('deleteConfirmDescription'))) {
            const res = await deleteExpense(id, storeId)
            if (res.success) {
                toast.success(t('expenseDeleted'))
                refreshData()
            } else {
                toast.error(res.message)
            }
        }
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const q = formData.get('query') as string
        const params = new URLSearchParams(searchParams)
        if (q) params.set('query', q)
        else params.delete('query')
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <form onSubmit={handleSearch} className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        name="query"
                        defaultValue={query}
                        placeholder={t('search')}
                        className="pl-9 bg-white"
                    />
                </form>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange hover:bg-orange-dark text-white font-bold"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addExpense')}
                </Button>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold">{t('date')}</TableHead>
                            <TableHead className="font-bold">{t('category')}</TableHead>
                            <TableHead className="font-bold">{t('description')}</TableHead>
                            <TableHead className="font-bold text-right">{t('amount')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500 font-medium">
                                    {t('noExpensesFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.data.map((expense: any) => (
                                <TableRow key={expense._id} className="hover:bg-slate-50/50">
                                    <TableCell className="text-sm">
                                        {formatDate(expense.date)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                            {expense.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-slate-600 text-sm">
                                        {expense.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-navy">
                                        {formatCurrency(expense.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-rose-600 transition-colors"
                                            onClick={() => handleDelete(expense._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {data.totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={data.totalPages}
                />
            )}

            <ExpenseModal
                storeId={storeId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refreshData}
            />
        </div>
    )
}
