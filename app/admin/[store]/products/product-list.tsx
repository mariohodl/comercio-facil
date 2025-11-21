/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Import,
  Plus,
  RefreshCw,
  Search,
  Trash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  deleteProduct,
  getAllProductsForAdmin,
  getAllCategories,
  getAllBrands,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import React, { useEffect, useState, useTransition } from 'react'
import { formatCurrency } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import Image from 'next/image'

type ProductListDataProps = {
  products: IProduct[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [category, setCategory] = useState<string>('all')
  const [brand, setBrand] = useState<string>('all')
  const [data, setData] = useState<ProductListDataProps>()
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchData = (newPage?: number) => {
    startTransition(async () => {
      const result = await getAllProductsForAdmin({
        query: inputValue,
        page: newPage || page,
        category,
        brand,
      })
      setData(result)
    })
  }

  useEffect(() => {
    const init = async () => {
      const [cats, brds] = await Promise.all([
        getAllCategories(),
        getAllBrands(),
      ])
      setCategories(cats)
      setBrands(brds)
      fetchData()
    }
    init()
  }, [])

  useEffect(() => {
    fetchData(1)
    setPage(1)
  }, [inputValue, category, brand])

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    fetchData(newPage)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='font-bold text-2xl'>Product List</h1>
          <p className='text-muted-foreground text-sm'>Manage your products</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='icon'>
            <FileText className='w-4 h-4 text-red-500' />
          </Button>
          <Button variant='outline' size='icon'>
            <FileSpreadsheet className='w-4 h-4 text-green-500' />
          </Button>
          <Button variant='outline' size='icon' onClick={() => fetchData()}>
            <RefreshCw className='w-4 h-4' />
          </Button>
          <Button asChild className='bg-orange-500 hover:bg-orange-600 text-white'>
            <Link href='/admin/products/create'>
              <Plus className='w-4 h-4 mr-2' /> Add Product
            </Link>
          </Button>
          <Button variant='default' className='bg-slate-900 text-white'>
            <Import className='w-4 h-4 mr-2' /> Import Product
          </Button>
        </div>
      </div>

      <div className='bg-white p-4 rounded-lg border shadow-sm space-y-4'>
        <div className='flex flex-col md:flex-row justify-between gap-4'>
          <div className='relative w-full md:w-72'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search...'
              value={inputValue}
              onChange={handleInputChange}
              className='pl-8'
            />
          </div>
          <div className='flex gap-2'>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Brand' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableHead className='w-12'>
                  <Checkbox />
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className='text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center h-24'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center h-24'>
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className='font-medium text-gray-500'>
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div className='relative w-10 h-10 rounded-md overflow-hidden border bg-gray-100'>
                          <Image
                            src={product.images[0]?.imgUrl || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className='object-cover'
                          />
                        </div>
                        <span className='font-medium'>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.isProductKg ? 'Kg' : 'Pc'}</TableCell>
                    <TableCell>{product.countInStock}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          asChild
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-blue-500'
                        >
                          <Link href={`/product/${product.slug}`} target='_blank'>
                            <Eye className='w-4 h-4' />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-green-500'
                        >
                          <Link href={`/admin/products/${product._id}`}>
                            <Edit className='w-4 h-4' />
                          </Link>
                        </Button>
                        <DeleteDialog
                          id={product._id}
                          action={deleteProduct}
                          callbackAction={() => fetchData()}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Row Per Page
            <Select defaultValue='10'>
              <SelectTrigger className='w-[70px] inline-flex ml-2 h-8'>
                <SelectValue placeholder='10' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='50'>50</SelectItem>
              </SelectContent>
            </Select>
            <span className='ml-2'>Entries</span>
          </div>

          {(data?.totalPages ?? 0) > 1 && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange('prev')}
                disabled={Number(page) <= 1}
                className='h-8 w-8'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <div className='flex gap-1'>
                {Array.from({ length: data?.totalPages || 0 }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? 'default' : 'outline'}
                    size='icon'
                    className={`h-8 w-8 ${page === i + 1 ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => {
                      setPage(i + 1)
                      fetchData(i + 1)
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange('next')}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
                className='h-8 w-8'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList