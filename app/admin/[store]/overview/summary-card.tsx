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
            <CardContent className='p-5 sm:p-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500', iconClassName)}>
                            <Icon className='h-6 w-6' />
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                'text-[10px] font-semibold uppercase tracking-widest leading-none mb-1',
                                isDark ? 'text-slate-300' : 'text-slate-400'
                            )}>
                                {title}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <h3 className={cn(
                                    'text-xl sm:text-2xl font-bold tracking-tight',
                                    isDark ? 'text-white' : 'text-slate-900'
                                )}>
                                    {value}
                                </h3>
                                {/* {percentage !== undefined && (
                                    <span
                                        className={cn(
                                            'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tighter',
                                            percentage >= 0
                                                ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                                : (isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600')
                                        )}
                                    >
                                        {percentage >= 0 ? '↑' : '↓'}
                                        {Math.abs(percentage)}%
                                    </span>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <Icon size={100} />
                </div>
            </CardContent>
        </Card>
    )
}
