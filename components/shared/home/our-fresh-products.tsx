import React from 'react'
import { CustomH2 } from '../CustomH2'
import { CustomH3 } from '../CustomH3';
import { CustomP } from '../CustomP'
import Image from 'next/image';

export const OurFreshProducts = () => {

  const products = [
    {
      name: "Res para asar",
      description: "Nuestra carne molida premium es perfecta para hacer hamburguesas jugosas, salsas de carne y el clásico pastel de carne.",
      id: "12",
      listPrice: 12.77,
      isProductKg: false,
      image: ''
    },
    {
      name: "Salchicha italiana",
      description: "Nuestra carne molida premium es perfecta para hacer hamburguesas jugosas, salsas de carne y el clásico pastel de carne.",
      id: "16",
      listPrice: 22.87,
      isProductKg: false,
      image: ''
    },
    {
      name: "Res para asar",
      description: "Nuestra carne molida premium es perfecta para hacer hamburguesas jugosas, salsas de carne y el clásico pastel de carne.",
      id: "12",
      listPrice: 12.77,
      isProductKg: false,
      image: ''
    },
]
  
  return (
    <section className="bg-black text-white ">
      <article className="w-full py-20 px-16 ">
        <div className='text-center mx-auto max-w-[680px]'>
          <CustomH3 classNames="uppercase text-red-800 font-semibold font-sans mb-5">
            Los Mejores Productos
          </CustomH3>

          <CustomH2 classNames="mb-5">
            Lo mejor, nuestra excepcional selección de carnes
          </CustomH2>

          <CustomP classNames="font-sans">
          Tenemos un lugar único para los amantes de la carne que aprecian la calidad, la variedad y un servicio excepcional.
          </CustomP>
        </div>

        <div className='w-[1000px] mx-auto'>
          <div className='flex justify-center flex-wrap'>
            {
              products.length > 0 && (
                products.map(prod => {
                  return (
                    <div className='flex w-[400px] m-10' key={prod.id}>
                      <Image src={prod.image || "/images/cerdo-category-product.jpg"} alt="img" width={90} height={90}/>
                      <div className='w-full'>
                        <div className='flex items-center justify-between'>
                          <h3 className='w-full'>{prod.name}</h3>
                          <div className='flex p-2 w-full'>
                            <div className='w-full border-t border-dashed'></div>
                          </div>
                          
                          <h4>{prod.listPrice}</h4>
                        </div>
                      </div>
                    </div>
                    )
                })
              )
            }
          </div>
        </div>

      </article>
    </section>
  )
}
