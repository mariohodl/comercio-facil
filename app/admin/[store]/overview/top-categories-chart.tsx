'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface TopCategoriesChartProps {
    data: {
        _id: string // Category name
        totalSales: number
    }[]
}

const COLORS = ['#f97316', '#1e293b', '#10b981', '#3b82f6', '#ef4444']

export default function TopCategoriesChart({ data }: TopCategoriesChartProps) {
    const totalCategories = data.length
    const totalSales = data.reduce((acc, curr) => acc + curr.totalSales, 0)

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Top Categories</CardTitle>
                <div className='text-sm text-muted-foreground'>Weekly</div>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-center'>
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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [value, 'Sales']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className='ml-6 space-y-2'>
                        {data.slice(0, 3).map((entry, index) => (
                            <div key={index} className='flex items-center gap-2'>
                                <div className='h-3 w-1 rounded-full' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <div>
                                    <p className='text-xs text-muted-foreground'>{entry._id}</p>
                                    <p className='font-bold'>{entry.totalSales} <span className='text-xs font-normal text-muted-foreground'>Sales</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='mt-6 space-y-2 border-t pt-4'>
                    <div className='flex justify-between text-sm'>
                        <span className='flex items-center gap-2'>
                            <span className='h-2 w-2 rounded-full bg-purple-600'></span>
                            Total Categories
                        </span>
                        <span className='font-bold'>{totalCategories}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                        <span className='flex items-center gap-2'>
                            <span className='h-2 w-2 rounded-full bg-orange-500'></span>
                            Total Sales
                        </span>
                        <span className='font-bold'>{totalSales}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
