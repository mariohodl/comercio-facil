'use client'
import React from 'react'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: number
  className?: string
}

const Spinner = ({ size = 48, className = "" }: SpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        size={size}
        className="animate-spin text-orange transition-all duration-700"
      />
    </div>
  )
}

export default Spinner