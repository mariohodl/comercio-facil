import React from 'react'
import { getExpenses } from '@/lib/actions/expense.actions'
import ExpenseList from './expense-list'
import { CustomH1 } from '@/components/shared/CustomH1'
import { getTranslations } from 'next-intl/server'

export default async function ExpensesPage({
    params,
    searchParams,
}: {
    params: { store: string }
    searchParams: { page?: string; query?: string }
}) {
    const storeId = params.store
    const page = Number(searchParams.page) || 1
    const query = searchParams.query || ''
    const t = await getTranslations('admin.expenses')

    const expensesData = await getExpenses({
        storeId,
        page,
        query,
    })

    return (
        <div className="space-y-6 flex flex-col h-full bg-slate-50/30 p-4 lg:p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-bold text-navy tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-sm md:text-md text-slate-500 font-medium">
                    {t('manageExpenses')}
                </p>
            </div>

            <ExpenseList storeId={storeId} initialData={expensesData} />
        </div>
    )
}
