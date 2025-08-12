import React from 'react'

export const CustomH4 = ({children, classNames}) => {
  return (
    <h4 className={`text-md ${classNames}`}>{children || 'CustomH4'}</h4>
  ) 
}
