import React from 'react'

export const CustomP = ({children, classNames}: { children: React.ReactNode, classNames: string}) => {
  return (
    <p className={`text-sm ${classNames}`}>{children || 'CustomP'}</p>
  ) 
}
