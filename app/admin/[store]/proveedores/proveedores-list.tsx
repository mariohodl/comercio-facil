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
import { Card, CardContent } from '@/components/ui/card'

import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Search, Plus, Store, Users, Edit } from 'lucide-react'

type ProveedoresListDataProps = {
  proveedores: IProveedor[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

const ProveedoresList = ({ store }: { store: string }) => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProveedoresListDataProps>()
  const [isPending, startTransition] = useTransition()

  const refreshData = () => {
    startTransition(async () => {
      const data = await getAllProveedoresForAdmin({
        query: inputValue,
        page,
        storeId: store,
      })
      setData(data)
    })
  }

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    startTransition(async () => {
      const data = await getAllProveedoresForAdmin({
        query: inputValue,
        page: newPage,
        storeId: store,
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as any).debounce)
        ; (window as any).debounce = setTimeout(() => {
          startTransition(async () => {
            const data = await getAllProveedoresForAdmin({ query: value, page: 1, storeId: store })
            setData(data)
          })
        }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllProveedoresForAdmin({ query: '', page, storeId: store })
        setData(data)
      })
    }
  }

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProveedoresForAdmin({ query: '', storeId: store })
      setData(data)
    })
  }, [store])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Proveedores</h1>
          <p className='text-sm text-gray-500'>
            Administra los proveedores de tu negocio para usar en tus compras.
          </p>
        </div>
        <Button asChild className='bg-orange hover:bg-orange/90 text-white font-bold h-11 px-6 rounded-xl shadow-sm'>
          <Link href={`/admin/${store}/proveedores/nuevo-proveedor`}>
            <Plus className='w-4 h-4 mr-2' />
            Crear Proveedor
          </Link>
        </Button>
      </div>

      <Card className='border-slate-200 shadow-sm'>
        <CardContent className='p-0'>
          <div className='p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-t-xl'>
            <div className='relative w-full sm:w-96'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                className='pl-9 bg-white border-gray-200 focus:border-orange'
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                placeholder='Buscar proveedores por nombre...'
              />
            </div>

            <div className='text-sm text-gray-500 font-medium whitespace-nowrap'>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-orange/20 border-t-orange animate-spin" />
                  Cargando...
                </span>
              ) : (
                <span>
                  {data?.totalProducts === 0
                    ? 'Sin resultados'
                    : `Mostrando ${data?.from || 0}-${data?.to || 0} de ${data?.totalProducts || 0}`}
                </span>
              )}
            </div>
          </div>

          <div className='overflow-x-auto'>
            {data?.proveedores?.length === 0 && !isPending ? (
              <div className='flex flex-col items-center justify-center p-12 text-center'>
                <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
                  <Users className='w-8 h-8 text-slate-300' />
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-1'>No hay proveedores creados</h3>
                <p className='text-slate-500 max-w-sm mx-auto'>
                  Aún no tienes proveedores registrados o no coinciden con tu búsqueda.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className='bg-slate-50/50'>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='font-semibold text-slate-600'>Id</TableHead>
                    <TableHead className='font-semibold text-slate-600'>Nombre</TableHead>
                    <TableHead className='font-semibold text-slate-600'>Clave</TableHead>
                    <TableHead className='font-semibold text-slate-600'>Fecha de Creación</TableHead>
                    <TableHead className='font-semibold text-slate-600 text-right pr-6'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.proveedores?.map((proveedor: IProveedor) => (
                    <TableRow key={proveedor._id} className='hover:bg-slate-50/50 transition-colors'>
                      <TableCell className='text-slate-500 font-mono text-xs'>
                        {formatId(proveedor._id)}
                      </TableCell>
                      <TableCell className='font-medium text-gray-900'>
                        <span className='flex items-center gap-2'>
                          <div className='w-6 h-6 rounded-full bg-orange/10 flex items-center justify-center text-orange text-[10px] font-bold'>
                            {proveedor.nameProvider.charAt(0).toUpperCase()}
                          </div>
                          {proveedor.nameProvider}
                        </span>
                      </TableCell>
                      <TableCell className='text-slate-600'>
                        {proveedor.clave || '-'}
                      </TableCell>
                      <TableCell className='text-slate-500'>
                        {formatDateTime(proveedor.createdAt).dateTime}
                      </TableCell>
                      <TableCell className='text-right pr-6'>
                        <div className='flex justify-end items-center gap-1.5'>
                          {/* Removed broken link to product edit */}
                          <DeleteDialog
                            id={proveedor._id}
                            action={deleteProveedor}
                            callbackAction={() => {
                              startTransition(async () => {
                                const newData = await getAllProveedoresForAdmin({
                                  query: inputValue,
                                  page,
                                  storeId: store,
                                })
                                setData(newData)
                              })
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {(data?.totalPages ?? 0) > 1 && (
            <div className='p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-b-xl'>
              <Button
                variant='outline'
                size="sm"
                onClick={() => handlePageChange('prev')}
                disabled={Number(page) <= 1}
                className='font-medium'
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <div className='text-sm font-medium text-slate-600'>
                Página {page} de {data?.totalPages}
              </div>
              <Button
                variant='outline'
                size="sm"
                onClick={() => handlePageChange('next')}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
                className='font-medium'
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProveedoresList;