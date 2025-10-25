import React from 'react'

export const CustomH2 = ({children, classNames}) => {
  return (
    <h2 className={`text-[20px]/[25px] md:text-[33px]/[43px] font-semibold ${classNames}`}>{children || 'CustomH2'}</h2>
  ) 
}
