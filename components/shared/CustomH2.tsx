import React from 'react'

export const CustomH2 = ({children, classNames}: { children: React.ReactNode, classNames: string}) => {
  return (
    <h2 className={`text-[20px]/[25px] md:text-[33px]/[43px] font-bold ${classNames}`}>{children || 'CustomH2'}</h2>
  ) 
}
