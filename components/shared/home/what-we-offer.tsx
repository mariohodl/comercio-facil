import React from 'react'
import Image from 'next/image'

export const WhatWeOffer = () => {
  return (
    <section className="bg-red-800 text-white">
      <div className="bg-[url('/images/blur-bg.png')] w-full p-7 bg-cover bg-center">
        <article className='container mx-auto'>
          <div className='flex flex-col lg:flex-row justify-around'>
            <div className='offer-item mb-12 flex flex-col lg:flex-row lg:mb-0  items-center'>
              <Image src="/images/cow-100x100.png" width={56} height={56} alt="Vaca icon"/>
              <h3 className='text-2xl mt-2 ml-3 lg:mt-0'>Carne Premium</h3>
            </div>
            <div className='offer-item mb-12 flex flex-col lg:flex-row lg:mb-0  items-center'>
              <Image src="/images/butchery-100x100.png" width={50} height={50} alt="Vaca icon"/>
              <h3 className='text-2xl mt-2 ml-3 lg:mt-0'>Ámplia Selección</h3>
            </div>
            <div className='offer-item mb-12 flex flex-col lg:flex-row lg:mb-0  items-center'>
              <Image src="/images/butcher.png" width={50} height={50} alt="Vaca icon"/>
              <h3 className='text-2xl mt-2 ml-3 lg:mt-0'>Cortes Perfectos</h3>
            </div>
          </div>
        </article>
      </div>
      
    </section>
  )
}
