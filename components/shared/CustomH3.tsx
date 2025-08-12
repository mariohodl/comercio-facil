import React from 'react'

export const CustomH3 = ({children, classNames}) => {
  return (
    <h3 className={`text-[17px] md:text-[23px]/[33px] ${classNames}`}>{children || 'CustomH3'}</h3>
  ) 
}
