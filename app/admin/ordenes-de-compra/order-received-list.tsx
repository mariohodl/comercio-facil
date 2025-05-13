/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'
import { IOrderReception } from '@/lib/db/models/orderReception.model';


import DeleteDialog from '@/components/shared/delete-dialog'
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
  deleteOrderReceived,
  getAllOrdersReceivedForAdmin,
} from '@/lib/actions/orderReception.actions'

import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ProductListDataProps = {
  orders: IOrderReception[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}
const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps>()
  const [isPending, startTransition] = useTransition()

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    if (changeType === 'next') {
      setPage(newPage)
    } else {
      setPage(newPage)
    }
    startTransition(async () => {
      const data = await getAllOrdersReceivedForAdmin({
        query: inputValue,
        page: newPage,
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as any).debounce)
      ;(window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllOrdersReceivedForAdmin({ query: value, page: 1 })
          setData(data)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllOrdersReceivedForAdmin({ query: '', page })
        setData(data)
      })
    }
  }
  useEffect(() => {
    startTransition(async () => {
      const data = await getAllOrdersReceivedForAdmin({ query: '' })
      setData(data)
    })
  }, [])

  return (
    <div>
      <div className='space-y-2'>
        <div className='flex-between flex-wrap gap-2'>
          <div className='flex flex-wrap items-center gap-2 '>
            <h1 className='font-bold text-lg'>Ordenes recibidas</h1>
            <div className='flex flex-wrap items-center  gap-2 '>
              <Input
                className='w-auto'
                type='text '
                value={inputValue}
                onChange={handleInputChange}
                placeholder='Filtrar por nombre...'
              />

              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {data?.totalProducts === 0
                    ? 'No'
                    : `${data?.from}-${data?.to} of ${data?.totalProducts}`}
                  {' results'}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant='default'>
            <Link href='/admin/ordenes-de-compra/recepcion-de-compra'>Crear orden de compra</Link>
          </Button>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className='text-right'>Monto</TableHead>
                <TableHead>Pagada</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className='w-[100px]'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.orders.map((ordenReceived: IOrderReception) => (
                <TableRow key={ordenReceived._id}>
                  <TableCell>{formatId(ordenReceived._id)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/products/${ordenReceived._id}`}>
                      {ordenReceived.nameProvider}
                    </Link>
                  </TableCell>
                  <TableCell className='text-right'>${ordenReceived.total}</TableCell>
                  <TableCell>{ordenReceived.isPaid ? 'Si' : 'No'}</TableCell>
                  <TableCell>
                    {formatDateTime(ordenReceived.updatedAt).dateTime}
                  </TableCell>
                  <TableCell className='flex gap-1'>
                    <Button asChild variant='outline' size='sm'>
                      <Link href={`/admin/products/${ordenReceived._id}`}>Edit</Link>
                    </Button>
                    <Button asChild variant='outline' size='sm'>
                      <Link target='_blank' href={`/ordenReceived/${ordenReceived._id}`}>
                        View
                      </Link>
                    </Button>
                    <DeleteDialog
                      id={ordenReceived._id}
                      action={deleteOrderReceived}
                      callbackAction={() => {
                        startTransition(async () => {
                          const data = await getAllOrdersReceivedForAdmin({
                            query: inputValue,
                          })
                          setData(data)
                        })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(data?.totalPages ?? 0) > 1 && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => handlePageChange('prev')}
                disabled={Number(page) <= 1}
                className='w-24'
              >
                <ChevronLeft /> Previous
              </Button>
              Page {page} of {data?.totalPages}
              <Button
                variant='outline'
                onClick={() => handlePageChange('next')}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
                className='w-24'
              >
                Next <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList