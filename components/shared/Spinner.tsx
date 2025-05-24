'use client'
import React from 'react'
import { Ring } from 'react-css-spinners'

const Spinner = () => {
  return (
    <div>
      <section className="flex justify-center items-center w-full h-screen bg-black bg-opacity-80 absolute" style={{ zIndex: 9999 }}>
        <Ring
          size={150}
          color="#fff"
          className="animate-spin"
          style={{ width: '150px', height: '150px' }}
        />
      </section>
    </div>
                          
  )
}

export default Spinner