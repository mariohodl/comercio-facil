import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export const WhatWeOffer = () => {
  const t = useTranslations('landing')
  return (
    <section className="bg-red-800 text-white">
      <div className="bg-[url('/images/blur-bg.png')] w-full p-7 bg-cover bg-center">
        <article className='container mx-auto'>
          <div className='flex flex-col lg:flex-row justify-around'>
            <div className='offer-item mb-8 lg:mb-0 flex flex-col lg:flex-row items-center text-center lg:text-left'>
              <Image src="/images/cow-100x100.png" width={56} height={56} alt="Vaca icon" />
              <h3 className='text-xl lg:text-2xl mt-2 lg:mt-0 lg:ml-3'>{t('premiumMeat')}</h3>
            </div>
            <div className='offer-item mb-8 lg:mb-0 flex flex-col lg:flex-row items-center text-center lg:text-left'>
              <Image src="/images/butchery-100x100.png" width={50} height={50} alt="Vaca icon" />
              <h3 className='text-xl lg:text-2xl mt-2 lg:mt-0 lg:ml-3'>{t('wideSelection')}</h3>
            </div>
            <div className='offer-item flex flex-col lg:flex-row items-center text-center lg:text-left'>
              <Image src="/images/butcher.png" width={50} height={50} alt="Vaca icon" />
              <h3 className='text-xl lg:text-2xl mt-2 lg:mt-0 lg:ml-3'>{t('perfectCuts')}</h3>
            </div>
          </div>
        </article>
      </div>

    </section>
  )
}
