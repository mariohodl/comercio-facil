import React from 'react'
import { CustomH2 } from '../CustomH2'
import { CustomH3 } from '../CustomH3';
import { CustomH4 } from '../CustomH4';
import { CustomP } from '../CustomP'
import Image from 'next/image';
import { MoveRight } from 'lucide-react';

export const WhatWeDoCategories = () => {
  const categories = [{
      name: 'Res',
      description: 'Una carne popular que viene en muchos cortes y es conocida por su sabor rico y sabroso.',
      categoryType: 'beef'
    },
    {
      name: 'Pollo',
      description: 'Una fuente de proteína magra que es fácil de cocinar y se puede usar en muchas recetas diferentes.',
      categoryType: 'chicken'
    },
    {
      name: 'Cerdo',
      description: 'Una carne popular que viene en muchos cortes y es conocida por su sabor rico y sabroso.',
      categoryType: 'pork'
    },
    {
      name: 'Cordero',
      description: 'xxxx',
      categoryType: 'lamb'
    },
  ]
  return (
    <section className="bg-[#fef8ef] ">
      <article className="bg-[url('/images/meats-bg.png')] w-full py-7 px-5 md:py-20 md:px-4 lg:px-16 bg-cover bg-center">
        <div className='text-center w-full mx-auto lg:w-[680px]'>
          <CustomH3 classNames="uppercase text-red-800 font-semibold font-sans mb-4">
            Lo que hacemos
          </CustomH3>

          <CustomH2 classNames="mb-5">
            Experimenta la diferencia de carne realmente excepcional
          </CustomH2>

          <CustomP classNames="font-sans">
            En general, somos un lugar único para los amantes de la carne que aprecian la calidad, la variedad y  excepcional servicio.
          </CustomP>
        </div>

        <div className='flex flex-col md:flex-row md:flex-wrap item-center justify-center mt-7'>
          {
            categories?.length > 0 && categories.map((category, index) => {
              return (
                <div key={index} className='w-full md:w-[310px]  bg-white mb-7 md:m-5 border border-dashed border-black '>
                  <div>
                    <div className='flex justify-center items-center mt-10 '>
                      <div className=' w-[120] h-[120]'>
                        <Image src={`/icons/${category.categoryType}-flat-icon.png`} width={120}  height={120} alt={category.name}/>
                      </div>
                    </div>
                    <div className='p-5'>
                      <CustomH3 classNames="text-center mb-2">{category.name}</CustomH3>
                      <CustomP classNames="text-base text-center font-sans">{category.description}</CustomP>
                      <div className='flex justify-center'>
                        <CustomH4 classNames="uppercase font-sans font-semibold text-center text-primary mt-3 hover:underline hover:cursor-pointer flex items-center">Descubrir <MoveRight className='ml-2' size={25}/></CustomH4>
                      </div>
                      
                    </div>
                    
                  </div>
                </div>
              )
            })
          }
          
          
        </div>
      </article>
    </section>
  )
}
