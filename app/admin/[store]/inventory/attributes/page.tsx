import React from 'react'
import { useTranslations } from 'next-intl'

export default function VariantAttributesPage() {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold mb-4'>{t('variantAttributes')}</h1>
            <p className='text-gray-500'>{tCommon('comingSoon')}</p>
        </div>
    )
}
