'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useTranslations } from 'next-intl'

interface TopCategoriesChartProps {
    data: {
        _id: string // Category name
        totalSales: number
    }[]
}

const COLORS = ['#f97316', '#1e293b', '#10b981', '#3b82f6', '#ef4444']

export default function TopCategoriesChart({ data }: TopCategoriesChartProps) {
    const t = useTranslations('admin.dashboard')
    const totalCategories = data.length
    const totalSales = data.reduce((acc, curr) => acc + curr.totalSales, 0)

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-bold text-navy uppercase tracking-wider'>{t('topCategories')}</CardTitle>
                <div className='text-[10px] uppercase font-semibold text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded-md'>{t('weekly')}</div>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-center py-4'>
                    <div className='h-[200px] w-[200px] relative'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey='totalSales'
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [value, t('sales')]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className='ml-6 space-y-4'>
                        {data.slice(0, 3).map((entry, index) => (
                            <div key={index} className='flex items-center gap-2'>
                                <div className='h-4 w-1.5 rounded-full' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <div>
                                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1'>{entry._id}</p>
                                    <p className='text-sm font-bold text-slate-900'>{entry.totalSales} <span className='text-[10px] font-semibold text-slate-400'>{t('sales')}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='mt-6 space-y-3 border-t border-slate-50 pt-4'>
                    <div className='flex justify-between items-center'>
                        <span className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                            <span className='h-2 w-2 rounded-full bg-slate-900'></span>
                            {t('totalCategories')}
                        </span>
                        <span className='text-sm font-bold text-slate-900'>{totalCategories}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                        <span className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                            <span className='h-2 w-2 rounded-full bg-orange'></span>
                            {t('totalSales')}
                        </span>
                        <span className='text-sm font-bold text-slate-900'>{totalSales}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
