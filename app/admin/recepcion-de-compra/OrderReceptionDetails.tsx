'use client'
import React from 'react'
// import Product from '@/lib/db/models/product.model';
import { MKInput } from '@/components/shared/MKInput'
import { MKButton } from '@/components/shared/MKButton'
import { useForm, SubmitHandler } from 'react-hook-form'

type FormFields = {
  nameProvider: string
  clave: string
  facturaNumber: string
  dateAdded: string
}

const OrderReceptionDetails = () => {

  const { register, handleSubmit } = useForm<FormFields>()

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    console.log('data', data)
  }
  return (
    <form className='w-full' onSubmit={handleSubmit(onSubmit)}>

      <div className='flex'>
        <div className='m-3 w-1/2'>
          <MKInput
            label="Nombre del proveedor"
            field='nameProvider'
            register={register}
            placeholder="Ingresa el nombre del proveedor"
          />
        </div>

        <div className='m-3 w-1/3'>
          <MKInput
            label="Clave del proveedor"
            field='clave'
            register={register}
            placeholder="Ingresa la clave del proveedor"
          />
        </div>

        <div className='m-3 w-1/3'>
          <MKInput
            label="Número de factura"
            field='facturaNumber'
            register={register}
            placeholder="Ingresa el numero de factura"
          />
        </div>
      </div>
      <div className='flex m-3'>
        <MKButton>Submit</MKButton>
      </div>
    </form>
  )
}

export default OrderReceptionDetails