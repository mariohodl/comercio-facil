'use client'
import React from 'react'

import RedirectAction from './redirectAction'


const PagoExitoso = (props) => {
    // const { showSuccess, showError} = useToast()
    // const router = useRouter()
    // const params =  props.params
    // const { id } = params



    return (
    <div>
        <div className='min-h-full w-full'>
            <div className=' flex justify-center items-center'>
                <RedirectAction parentProps={props}/>
                
            </div>
        </div>
    </div>
    )
}

export default PagoExitoso