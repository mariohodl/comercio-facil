import React from 'react'
import { Play } from 'lucide-react'

export const WidgetVideo = () => {
  return (
    <div className="bg-[url('/images/big-meat-cut.png')] w-full h-[300px] md:h-[600px] bg-cover bg-center flex justify-center items-center">
      <div className='w-[60] h-[60] md:w-[80] md:h-[80] rounded-full bg-white hover:bg-red-800 hover:text-white hover:w-[65] hover:h-[65] md:hover:w-[85] md:hover:h-[85] cursor-pointer flex justify-center items-center transition-all'>
        <Play />
      </div>
    </div>

  )
}
