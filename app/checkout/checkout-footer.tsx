import { APP_NAME } from '@/lib/constants'
import Link from 'next/link'
import React from 'react'

export default function CheckoutFooter() {
  return (
    <div className='border-t-2 space-y-2 my-4 py-4'>
      <p>
       Necesitas ayuda? Puedes visitar nuestro <Link href='/page/help'>Centro de ayuda</Link> ó si lo prefieres{' '}
        <Link href='/page/contact-us'>Contáctanos</Link>{' '}.
      </p>

      <p>Para un pedido hecho desde {APP_NAME}: Cuando una orden es completada despues de hacer click en  el botón &apos;Completar Orden&apos;, te mandaremos un correo electrónico con el recibo de tu orden. Su orden de compra no será marcada como completada hasta que le enviemos un correo electrónico notificándole que el producto ha sido enviado. Al realizar su pedido, usted acepta las <Link href='/page/conditions-of-use'>Condiciones de Uso</Link> y{' '} el  {' '}
            <Link href='/page/privacy-policy'>Aviso de Privacidad</Link> de{' '}
            {APP_NAME}</p>
  
      <p>
        Dentro de los primeros 2 días del producto enviado,  puedes regresar el producto siempre y cuando cumpla con  su socndiciones integrales.{' '}
        <Link href='/page/returns-policy'>
          Ver  Política de devolución  en {APP_NAME}.
        </Link>
      </p>
    </div>
  )
}