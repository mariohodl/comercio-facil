import React from 'react'

export const CustomH3 = ({children, classNames}: { children: React.ReactNode, classNames: string}) => {
  return (
    <h3 className={`text-[17px] md:text-[23px]/[33px] font-bold ${classNames}`}>{children || 'CustomH3'}</h3>
  ) 
}
