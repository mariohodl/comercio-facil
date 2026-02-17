import { ReactNode } from 'react'

const SeparatorWithOr = ({ children }: { children?: ReactNode }) => {
  return (
    <div className='relative flex items-center py-6 w-full'>
      <div className='flex-grow border-t border-gray-200'></div>
      <span className='flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider'>
        {children ?? 'ó'}
      </span>
      <div className='flex-grow border-t border-gray-200'></div>
    </div>
  )
}

export default SeparatorWithOr