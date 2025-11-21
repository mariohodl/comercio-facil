import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    percentage?: number
    className?: string
    iconClassName?: string
}

export default function SummaryCard({
    title,
    value,
    icon: Icon,
    percentage,
    className,
    iconClassName,
}: SummaryCardProps) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className='p-6'>
                <div className='flex items-center justify-between space-x-4'>
                    <div className='flex items-center space-x-4'>
                        <div className={cn('p-2 rounded-lg bg-primary/10', iconClassName)}>
                            <Icon className='h-6 w-6 text-primary' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-muted-foreground'>
                                {title}
                            </p>
                            <h3 className='text-2xl font-bold'>{value}</h3>
                        </div>
                    </div>
                    {percentage !== undefined && (
                        <div
                            className={cn(
                                'flex items-center text-xs font-medium px-2 py-1 rounded-full',
                                percentage >= 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            )}
                        >
                            {percentage >= 0 ? '+' : ''}
                            {percentage}%
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
