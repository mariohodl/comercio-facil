import React from 'react'

export const CustomH1 = ({children, classNames}) => {
  return (
    <h1 className={`text-[58px] ${classNames}`}>{children || 'CustomH1'}</h1>
  ) 
}
