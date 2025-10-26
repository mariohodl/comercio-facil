'use client'
import React from 'react'
import { MKInput } from '@/components/shared/MKInput'
import { MKButton } from '@/components/shared/MKButton'
import { useForm, SubmitHandler} from 'react-hook-form'
import { createProveedor } from '@/lib/actions/proveedor.actions'
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


type FormFields = {
  nameProvider: string
  clave: string
  rfc: string
}

const CreateProveedor = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast()

  const { register, handleSubmit,} = useForm<FormFields>({
    defaultValues: {
      nameProvider: '',
      clave: '',
      rfc: '',
    },
  })


  const onSubmit: SubmitHandler<FormFields> = (data) => {
    // validations about the total and subtotal amount are needed here and in the backend before saaving to DB
    const proveedorData = {
      ...data,
    }
    console.log('proveedorData', proveedorData)
    createProveedor(proveedorData)
      .then((res) => {
        if (res?.success) {
          showSuccess('Proveedor creado correctamente')
          setTimeout(() => {
            router.push('/admin/proveedores')
          }, 500)
        } else {
          showError('Error al crear el proveedor')
        }
      })
      .catch((err) => {
        showError('Error al crear el proveedor')
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
            label="RFC del proveedor"
            field='rfc'
            register={register}
            placeholder="Ingresa el rfc del proveedor"
          />
        </div>
      </div>

   
      <div className='flex justify-center m-3 mt-10'>
        <MKButton>Guardar Proveedor</MKButton>
      </div>
    </form>
  )
}

export default CreateProveedor