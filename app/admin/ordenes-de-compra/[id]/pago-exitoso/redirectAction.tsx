'use client'
import React from 'react'
import { MKButton } from '@/components/shared/MKButton'
import { useRouter } from 'next/navigation'
import { updateOrderReceptionToPaid } from '@/lib/actions/orderReception.actions'
import { useToast } from '@/hooks/use-toast';

const RedirectAction =  ({parentProps}) => {

    const { showSuccess, showError} = useToast()
    const router = useRouter()
    const handleMarkAsPaid = async () =>{
        const { id } = await parentProps.params
        updateOrderReceptionToPaid(id)
            .then(res => {
                if(res.success){
                    showSuccess('Orden marcada como pagada correctamente!')
                    setTimeout(()=>{
                        router.replace(`/admin/ordenes-de-compra/${id}`)
                    },2000)
                }
            })
            .catch(err => {
                showError('Ha ocurrido un error')
                console.log('err', err)
            })
    }
    return (
    <div className='h-[600] flex items-center'>
        <div className='flex flex-col items-center'>
            <h3 className='text-xl  font-bold mb-7 text-green-600'>¡Pago de Orden Exitoso!</h3>
            <MKButton handleClick={handleMarkAsPaid}>Marcar Orden Pagada</MKButton>
        </div>
    </div>
    )
}

export default RedirectAction