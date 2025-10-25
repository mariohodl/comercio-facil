import React from 'react'

export const CustomP = ({children, classNames}) => {
  return (
    <p className={`text-lg md:text-lg/5 text-[#7A7A7A] font-light font-sans ${classNames}`}>{children || 'CustomP'}</p>
  ) 
}
