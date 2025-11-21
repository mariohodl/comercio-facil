'use client'

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from 'recharts'

interface SalesStaticsChartProps {
    data: {
        date: string
        totalSales: number
        totalPurchases: number
    }[]
}

export default function SalesStaticsChart({ data }: SalesStaticsChartProps) {
    return (
        <ResponsiveContainer width='100%' height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                    dataKey='date'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`$${value}`, '']}
                />
                <Legend />
                <Bar
                    dataKey='totalSales'
                    name='Revenue'
                    fill='#10b981' // Emerald-500
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                />
                <Bar
                    dataKey='totalPurchases'
                    name='Expense'
                    fill='#ef4444' // Red-500
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
