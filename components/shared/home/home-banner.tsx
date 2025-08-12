import React from 'react'
// import { CustomH1 } from '../CustomH1'
import { CustomH2 } from '../CustomH2'
import { CustomH3 } from '../CustomH3';
import { CustomP } from '../CustomP'
import { MKButton } from '../MKButton';
import Image from 'next/image';

export const HomeBanner = () => {
  return (
    <section className="bg-[#fef8ef] ">
      <article className="bg-[url('/images/meats-bg.png')] w-full bg-cover bg-center lg:pt-20">
        <div className='flex flex-col justify-between lg:flex-row-reverse lg:justify-center'>
          <div className='text-center lg:text-left pt-10 mb-12 lg:w-2/4 lg:mr-10 lg:px-16'>
            <div className='w-9/12 mx-auto lg:w-auto lg:mx-0'>
              <CustomH3 classNames="uppercase text-red-800 font-semibold font-sans mb-3">
                Donde cada corte es una pieza de arte
              </CustomH3>
              <CustomH2 classNames="my-3 lg:text-[60px]">
                Mejor carne, mejor vida.
              </CustomH2>
            </div>
            <div className='p-3 lg:px-0 lg:py-3'>
              <CustomP classNames="font-sans">
                Ya sea que tienes un emprendimiento, ó quizas carnicería o solo buscando algo para cocinar para su familia, lo tenemos cubierto.
              </CustomP>
            </div>
            <div className='mt-5'>
              <MKButton>Descubrir más</MKButton>
            </div>
          </div>

          <div className='lg:w-2/4'>
            <div className='flex justify-center lg:hidden'>
              <Image src="/images/carnicero.png" width={300} height={380} alt="carnicero"/>
            </div>

            <div className='hidden lg:flex justify-end h-full'>
              <Image src="/images/carnicero.png" width={580} height={780} alt="carnicero"/>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
