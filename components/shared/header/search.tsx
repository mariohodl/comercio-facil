import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
// import { getAllCategories } from '@/lib/actions/product.actions'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
import { APP_NAME } from '@/lib/constants'

export default async function Search() {
  // const categories = await getAllCategories()
  return (
    <form
      action='/search'
      method='GET'
      className='flex items-center w-full relative group'
    >
      <div className="relative flex-1">
        <Input
          className='w-full rounded-l-full border-gray-200 bg-gray-50 text-black text-sm h-11 pl-5 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all'
          placeholder={`Buscar en ${APP_NAME}...`}
          name='q'
          type='search'
        />
      </div>
      <button
        type='submit'
        className='bg-[#FF9800] hover:bg-[#F57C00] text-white h-11 px-6 rounded-r-full transition-colors flex items-center justify-center shadow-sm'
      >
        <SearchIcon className='w-5 h-5' />
      </button>
    </form>
  )
}