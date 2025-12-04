'use client'

import { Button } from '@/components/ui/button'
import { IProduct } from '@/lib/db/models/product.model'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SelectVariant({
  product,
}: {
  product: IProduct
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())

    // If clicking the already selected value, maybe we want to deselect?
    if (searchParams.get(key) === value) {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }

    router.push(`?${newParams.toString()}`, { scroll: false })
  }

  if (!product.attributes || product.attributes.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col gap-4'>
      {product.attributes.map((attr) => (
        <div key={attr.name}>
          <div className='font-bold mb-2 text-navy'>{attr.name}</div>
          <div className='flex flex-wrap gap-2'>
            {attr.values.map((val) => {
              const paramKey = attr.name.toLowerCase()
              const isSelected = searchParams.get(paramKey) === val

              return (
                <Button
                  key={val}
                  variant='outline'
                  className={cn(
                    'border-neutral-300',
                    isSelected && 'border-orange text-orange bg-orange-50 hover:bg-orange-100 hover:text-orange'
                  )}
                  onClick={() => handleSelect(paramKey, val)}
                >
                  {val}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}