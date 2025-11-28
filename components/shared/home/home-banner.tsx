import React from 'react'
import { useTranslations } from 'next-intl'
// import { CustomH1 } from '../CustomH1'
import { CustomH2 } from '../CustomH2'
import { CustomH3 } from '../CustomH3';
import { CustomP } from '../CustomP'
import { MKButton } from '../MKButton';
import Image from 'next/image';

export const HomeBanner = () => {
  const t = useTranslations('landing')
  return (
    <section className="bg-[#fef8ef] ">
      <article className="bg-[url('/images/meats-bg.png')] w-full bg-cover bg-center lg:pt-20">
        <div className='flex flex-col justify-between lg:flex-row-reverse lg:justify-center'>
          <div className='text-center lg:text-left pt-10 mb-12 lg:w-1/2 lg:mr-10 px-4 lg:px-16'>
            <div className='w-full md:w-9/12 mx-auto lg:w-auto lg:mx-0'>
              <CustomH3 classNames="uppercase text-red-800 font-semibold font-sans mb-3 text-lg lg:text-xl">
                {t('tagline')}
              </CustomH3>
              <CustomH2 classNames="my-3 text-4xl lg:text-[60px] leading-tight">
                {t('headline')}
              </CustomH2>
            </div>
            <div className='p-3 lg:px-0 lg:py-3'>
              <CustomP classNames="font-sans text-base lg:text-lg">
                {t('description')}
              </CustomP>
            </div>
            <div className='mt-5'>
              <MKButton>{t('discoverMore')}</MKButton>
            </div>
          </div>

          <div className='lg:w-1/2'>
            <div className='flex justify-center lg:hidden'>
              <Image src="/images/carnicero.png" width={300} height={380} alt="carnicero" className="w-auto h-auto max-w-[80%]" />
            </div>

            <div className='hidden lg:flex justify-end h-full'>
              <Image src="/images/carnicero.png" width={580} height={780} alt="carnicero" />
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
