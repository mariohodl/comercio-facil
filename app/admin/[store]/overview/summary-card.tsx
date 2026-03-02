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
    const isDark = className?.includes('text-white')

    return (
        <Card className={cn('group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5 active:scale-[0.98] border-none shadow-sm bg-white', className)}>
            <CardContent className='p-3 sm:p-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                        <div className={cn('w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0', iconClassName)}>
                            <Icon className='h-4 w-4 sm:h-6 sm:h-6' />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={cn(
                                'text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest leading-none mb-0.5 sm:mb-1 truncate',
                                isDark ? 'text-slate-300' : 'text-slate-400'
                            )}>
                                {title}
                            </span>
                            <div className="flex items-baseline gap-1 min-w-0">
                                <h3 className={cn(
                                    'text-base sm:text-2xl font-bold tracking-tight truncate',
                                    isDark ? 'text-white' : 'text-slate-900'
                                )}>
                                    {value}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Subtle background decoration - hidden on mobile to save visual space */}
                <div className="hidden sm:block absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Icon className="size-[100px]" />
                </div>
            </CardContent>
        </Card>
    )
}
