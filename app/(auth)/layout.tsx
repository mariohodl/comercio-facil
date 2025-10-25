import React from 'react'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col items-center min-h-screen highlight-link  '>
      <main className='w-full'>{children}</main>
    </div>
  )
}