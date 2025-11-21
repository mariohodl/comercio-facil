'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OrderStatisticsChartProps {
    data: {
        _id: { day: number; hour: number }
        count: number
    }[]
}

export default function OrderStatisticsChart({ data }: OrderStatisticsChartProps) {
    // Days: Sun (1) to Sat (7)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    // Hours: 2-hour blocks (2am, 4am, ..., 6pm, 8pm) - Simplified for visual
    // We'll map 24h to these blocks.
    const timeBlocks = ['2 Am', '4 Am', '6 Am', '8 Am', '10 Am', '12 Am', '2 Pm', '4 Pm', '6 Pm']

    // Helper to get opacity based on count
    const getOpacity = (dayIndex: number, timeIndex: number) => {
        // Map dayIndex (0=Mon) to MongoDB day (2=Mon, ..., 7=Sat, 1=Sun)
        const mongoDay = dayIndex === 6 ? 1 : dayIndex + 2

        // Map timeIndex to hour range. 
        // 0 -> 0-2, 1 -> 2-4, etc.
        const startHour = (timeIndex + 1) * 2

        // Find data points in this block
        const blockData = data.filter(d =>
            d._id.day === mongoDay &&
            d._id.hour >= startHour - 2 && d._id.hour < startHour
        )

        const total = blockData.reduce((acc, curr) => acc + curr.count, 0)

        if (total === 0) return 0.1 // Base opacity
        if (total < 3) return 0.4
        if (total < 6) return 0.7
        return 1
    }

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Order Statistics</CardTitle>
                <div className='text-sm text-muted-foreground'>Weekly</div>
            </CardHeader>
            <CardContent>
                <div className='flex'>
                    {/* Y-Axis Labels */}
                    <div className='flex flex-col-reverse justify-between mr-4 text-xs text-muted-foreground h-[200px] py-1'>
                        {timeBlocks.map((time) => (
                            <span key={time}>{time}</span>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className='flex-1 grid grid-cols-7 gap-1 h-[200px]'>
                        {days.map((day, dayIndex) => (
                            <div key={day} className='flex flex-col-reverse gap-1'>
                                {timeBlocks.map((_, timeIndex) => (
                                    <div
                                        key={timeIndex}
                                        className='flex-1 rounded-sm bg-orange-400 transition-opacity hover:opacity-80'
                                        style={{ opacity: getOpacity(dayIndex, timeIndex) }}
                                        title={`${day} ${timeBlocks[timeIndex]}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                {/* X-Axis Labels */}
                <div className='flex justify-between pl-12 mt-2 text-xs text-muted-foreground'>
                    {days.map(day => <span key={day} className='w-full text-center'>{day}</span>)}
                </div>
            </CardContent>
        </Card>
    )
}
