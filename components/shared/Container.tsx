import React from 'react'

const Container = ({children, classNames}: {children: React.ReactNode, classNames?: string}) => {
  return (
    <div className={`my-container mx-auto px-4 ${classNames}`}>
      {children}
    </div>
  )
}

export default Container