'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import PaymentForm from './payment-form'
import { MKButton } from '@/components/shared/MKButton'


const PaymentFormInterface =  (props: {
    order: any
    sessionRole: string | undefined
    clientSecret: string
    paypalClientId: string
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const { order, sessionRole, clientSecret, paypalClientId } = props;

  return (
    <div>
      {
        !showPaymentForm ? (
        <div>
          <MKButton handleClick={()=> setShowPaymentForm(true)}>Pagar Orden</MKButton>
        </div>
        ) : (
          <PaymentForm
            paymentMethod='Stripe'
            order={order}
            paypalClientId={paypalClientId}
            isAdmin={sessionRole === 'Admin' || false}
            clientSecret = { clientSecret }
          />
        )
      }
      
      
    </div>
    
  )
}

export default PaymentFormInterface