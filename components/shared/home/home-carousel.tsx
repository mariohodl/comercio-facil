'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
// import Link from 'next/link'
import { MKButton } from '@/components/shared/MKButton'

export function HomeCarousel({
  items,
}: {
  items: {
    image: string
    description: string
    url: string
    title: string
    buttonCaption: string
  }[]
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='w-full mx-auto '
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.title}>
              <div className='flex border-2 aspect-[16/6] items-center justify-center p-6 relative -m-1 text-center'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover'
                  priority
                />
                <div className='absolute bg-neutral-900 bg-opacity-50  w-full h-full  top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center'>
                <div className=''>
                  <h2 className='text-center text-7xl md:text-7xl font-medium mb-4 text-white max-w-[850px] mx-auto'>
                    {item.title}
                  </h2>
                  <h3 className='text-center mt-3 text-2xl mb-4 text-white max-w-[1050px] mx-auto'>
                    {item.description}
                  </h3>
                  <MKButton size='lg' variant='primary' className='mt-10 rounded-full bg-primary text-primary-foreground text-white hover:bg-white hover:text-black'>
                    {item.buttonCaption}
                  </MKButton>
                </div>
                  
                </div>
              </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious variant={'outline'} className='left-0 md:left-12' />
      <CarouselNext className='right-0 md:right-12' />
    </Carousel>
  )
}