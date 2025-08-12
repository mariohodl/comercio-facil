import React from 'react'

export const CustomP = ({children, classNames}) => {
  return (
    <p className={`text-lg md:text-2xl/8 text-[#7A7A7A] font-light font-sans ${classNames}`}>{children || 'CustomP'}</p>
  ) 
}
