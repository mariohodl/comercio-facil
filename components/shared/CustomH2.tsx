import React from 'react'

export const CustomH2 = ({children, classNames}) => {
  return (
    <h2 className={`text-[35px]/[40px] md:text-[48px]/[58px] font-semibold ${classNames}`}>{children || 'CustomH2'}</h2>
  ) 
}
