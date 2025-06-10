/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'
import { IProveedor } from '@/lib/db/models/proveedor.model';


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
  deleteProveedor,
  getAllProveedoresForAdmin,
} from '@/lib/actions/proveedor.actions'

import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ProveedoresListDataProps = {
  proveedores: IProveedor[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}
const ProveedoresList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProveedoresListDataProps>()
  const [isPending, startTransition] = useTransition()

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    if (changeType === 'next') {
      setPage(newPage)
    } else {
      setPage(newPage)
    }
    startTransition(async () => {
      const data = await getAllProveedoresForAdmin({
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
          const data = await getAllProveedoresForAdmin({ query: value, page: 1 })
          setData(data)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllProveedoresForAdmin({ query: '', page })
        setData(data)
      })
    }
  }
  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProveedoresForAdmin({ query: '' })
      setData(data)
    })
  }, [])

  return (
    <div>
      <div className='space-y-2'>
        <div className='flex-between flex-wrap gap-2'>
          <div className='flex flex-wrap items-center gap-2 '>
            <h1 className='font-bold text-lg'>Lista de proveedores</h1>
            <div className='flex flex-wrap items-center  gap-2 '>
              <Input
                className='w-auto'
                type='text '
                value={inputValue}
                onChange={handleInputChange}
                placeholder='Filtrar por nombre...'
              />

              {isPending ? (
                <p>Cargando...</p>
              ) : (
                <p>
                  {data?.totalProducts === 0
                    ? 'No hay'
                    : `${data?.from}-${data?.to} de ${data?.totalProducts}`}
                  {' resultados'}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant='default'>
            <Link href='/admin/proveedores/nuevo-proveedor'>Crear proveedor</Link>
          </Button>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Clave</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className='w-[100px]'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.proveedores.map((proveedor: IProveedor) => (
                <TableRow key={proveedor._id}>
                  <TableCell>{formatId(proveedor._id)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/proveedores/${proveedor._id}`}>
                      {proveedor.nameProvider}
                    </Link>
                  </TableCell>
                  <TableCell>
                      {proveedor.clave}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(proveedor.updatedAt).dateTime}
                  </TableCell>
                  <TableCell className='flex gap-1'>
                    <Button asChild variant='outline' size='sm'>
                      <Link href={`/admin/products/${proveedor._id}`}>Editar</Link>
                    </Button>
                    <DeleteDialog
                      id={proveedor._id}
                      action={deleteProveedor}
                      callbackAction={() => {
                        startTransition(async () => {
                          const data = await getAllProveedoresForAdmin({
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
                <ChevronLeft /> Anterior
              </Button>
              Página {page} de {data?.totalPages}
              <Button
                variant='outline'
                onClick={() => handlePageChange('next')}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
                className='w-24'
              >
                Siguiente <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProveedoresList;