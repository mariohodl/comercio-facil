import React from 'react'

export const CustomH4 = ({children, classNames}: { children: React.ReactNode, classNames: string}) => {
  return (
    <h4 className={`text-md font-bold ${classNames}`}>{children || 'CustomH4'}</h4>
  ) 
}
