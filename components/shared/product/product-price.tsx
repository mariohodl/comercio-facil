'use client'
import { cn, formatCurrency } from '@/lib/utils'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  forListing?: boolean
  plain?: boolean
}) => {
  // Ensure we don't show negative discounts if price > listPrice
  const discountPercent = Math.round(100 - (price / listPrice) * 100)
  const hasDiscount = listPrice > 0 && listPrice > price && discountPercent > 0
  const stringValue = price.toString()
  const [intValue, floatValue] = stringValue.includes('.')
    ? stringValue.split('.')
    : [stringValue, '']

  return plain ? (
    formatCurrency(price)
  ) : listPrice == 0 || !hasDiscount ? (
    <div className={cn('text-3xl', className)}>
      <span className='text-xs align-super'>$</span>
      {intValue}
      <span className='text-xs align-super'>{floatValue}</span>
    </div>
  ) : isDeal ? (
    <div className='space-y-2'>
      <div className='flex justify-center items-center gap-2'>
        <span className='bg-red-700 rounded-sm p-1 text-white text-sm font-semibold'>
          {discountPercent}% Menos
        </span>
        <span className='text-red-700 text-xs font-bold'>
          Oferta por tiempo limitado
        </span>
      </div>
      <div
        className={`flex ${forListing && 'justify-center'
          } items-center gap-2`}
      >
        <div className={cn('text-3xl', className)}>
          <span className='text-xs align-super'>$</span>
          {intValue}
          <span className='text-xs align-super'>{floatValue}</span>
        </div>
        <div className='text-muted-foreground text-xs py-2'>
          Antes:{' '}
          <span className='line-through'>{formatCurrency(listPrice)}</span>
        </div>
      </div>
    </div>
  ) : (
    <div className='flex items-center gap-2'>
      <div className={cn('text-3xl font-bold', className)}>
        <span className='text-xs align-super'>$</span>
        {intValue}
        <span className='text-xs align-super'>{floatValue}</span>
      </div>
      <div className='text-muted-foreground text-sm line-through'>
        {formatCurrency(listPrice)}
      </div>
      <div className='text-orange font-bold text-lg'>
        {discountPercent}% OFF
      </div>
    </div>
  )
}

export default ProductPrice