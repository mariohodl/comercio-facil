'use client'
import React from 'react'
// import Product from '@/lib/db/models/product.model';
import { MKInput } from '@/components/shared/MKInput'
import { MKButton } from '@/components/shared/MKButton'
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form'
import { MKTextarea } from '@/components/shared/MKTextarea'
import { AVAILABLE_CATEGORIES } from '@/lib/constants'
import { createOrderReception } from '@/lib/actions/orderReception.actions'
import { calculateTotalPriceOfProducts } from '@/lib/utils'
import { TAX_RATE } from '@/lib/constants'

type FormFields = {
  nameProvider: string
  clave: string
  facturaNumber: string
  rfc: string
  observations?: string
  isPaid?: boolean
  subtotal?: number
  total?: number
  iva?: number
  products: {
    name: string
    productId: string
    quantity: number
    price: number
    category: string
    isProductKg: boolean
  }[]
}

const OrderReceptionDetails = () => {

  const { register, handleSubmit, control, watch } = useForm<FormFields>({
    defaultValues: {
      nameProvider: '',
      clave: '',
      facturaNumber: '',
      rfc: '',
      observations: '',
      isPaid: false,
      subtotal: 0,
      total: 0,
      iva: 0,
      products: [{name: '', productId: '', quantity: 0, price: 0, category: '', isProductKg: true }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'products',
    control,
  })
  const productsWatcher = watch('products')
  const totalAmount  = calculateTotalPriceOfProducts(productsWatcher, true, true);
  const subTotalAmount = calculateTotalPriceOfProducts(productsWatcher, false, true);
  const onAddProductRow = () => {
    append({name: '', productId: '', quantity: 0, price: 0, category:'', isProductKg: true })
  }
  const onRemoveProduct = (index: number) => {
    remove(index)
  }




  const onSubmit: SubmitHandler<FormFields> = (data) => {
    // validations about the total and subtotal amount are needed here and in the backend before saaving to DB
    console.log('data', data)
    const orderReceptionData = {
      ...data,
      subtotal: Number(calculateTotalPriceOfProducts(productsWatcher, false, false)),
      total: Number(calculateTotalPriceOfProducts(productsWatcher, true, false)),
      iva: TAX_RATE,
    }
    console.log('orderReceptionData', orderReceptionData)
    createOrderReception(orderReceptionData)
      .then((res) => {
        console.log('res', res)
      })
      .catch((err) => {
        console.log('err', err)
      })

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

      <div className='flex'>
        <div className='m-3 w-1/3'>
          <MKInput
            label="RFC del proveedor"
            field='rfc'
            register={register}
            placeholder="Ingresa el rfc del proveedor"
          />
        </div>


        <div className='m-3 w-full'>
          <MKTextarea
            label="Observaciones"
            field='observations'
            register={register}
            placeholder="Observaciones generales"
          />
        </div>
      </div>

      <div className='mt-10'>
        <h3 className='text-2xl font-bold text-center'>Ingresar Productos</h3>
      </div>
      
      <div className='flex flex-col'>
        {fields.map((item, index) => (
          <div key={item.id} className='border-2 border-gray-300 rounded-md py-2 m-3 relative'>
            <div className='flex items-center mx-3'>
              <div className='m-3 w-1/2'>
                <MKInput
                  label="Nombre del producto"
                  field={`products.${index}.name`}
                  register={register}
                  placeholder="Ingresa el nombre del producto"
                />
              </div>
              <div className='m-3 w-1/4'>
                <MKInput
                  label="ID del producto"
                  field={`products.${index}.productId`}
                  register={register}
                  placeholder="Id de producto"
                />
              </div>

              <div className='m-3 w-1/4'>
                <p>Categoria</p>
                <select
                    {...register(`products.${index}.category`)}
                    className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  >
                    <option value="">Agrega categoría</option>
                    {AVAILABLE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
              </div>
              
              <div className='m-3 w-1/5'>
                <MKInput
                  label="Precio"
                  field={`products.${index}.price`}
                  register={register}
                  placeholder="Ingresa el precio"
                />
              </div>
              <div className='m-3 w-1/5'>
                <MKInput
                  label="Cantidad"
                  field={`products.${index}.quantity`}
                  register={register}
                  placeholder="Ingresa la cantidad"
                />
              </div>
              {
                index > 0 && (
                  <div className='w-6 h-6 bg-primary cursor-pointer flex flex-center flex-wrap items-center rounded-full absolute right-0 top-0'>
                    <span className='ml-2 text-white' onClick={() => onRemoveProduct(index)}>x</span>
                  </div>
                )
              }

            </div>
            <div className='flex items-center mx-3'>
              <div className='w-full flex justify-end'>

                <div className='flex'>
                  <p className='mr-2 text-center'>¿Es producto en kg? </p>
                  <input type="checkbox" {...register(`products.${index}.isProductKg`)} defaultChecked />
                </div>
              </div>
            </div>
            {
              index === fields.length - 1 && (
              <div className='flex justify-center'>
                <p className='underline cursor-pointer' onClick={onAddProductRow}>Agregar otro producto</p>
              </div>
            )}
            
          </div>
          
        ))}
      </div>
      <div className='flex justify-end mt-10'>
        <div>
          <p className='text-xl font-bold text-right'>Subtotal: {subTotalAmount}</p>
          <p className='text-xl font-bold text-right'>IVA: {TAX_RATE}%</p>
          <p className='text-2xl font-bold text-right'>Total: {totalAmount}</p>
        </div>
        
      </div>

      <div className='flex justify-center m-3 mt-10'>
        <MKButton>Guardar Recepción de Compra</MKButton>
      </div>
    </form>
  )
}

export default OrderReceptionDetails