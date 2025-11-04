import React from 'react'

export const CustomH1 = ({children, classNames}: { children: React.ReactNode, classNames: string}) => {
  return (
    <h1 className={`text-[58px] font-semibold${classNames}`}>{children || 'CustomH1'}</h1>
  ) 
}
