import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/actions/orderReception.actions'
import { formatCurrency } from '@/lib/utils'
import { Metadata } from 'next'
import { TAX_RATE } from '@/lib/constants'
import Stripe from 'stripe'
import { auth } from '@/auth'
import { CheckCircleIcon } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Order from '@/lib/db/models/order.model';
import PaymentFormInterface from '../paymentForm'


export const metadata: Metadata = {
  title: 'Orden de Compra',
  description: 'Detalles de la orden de compra',
}

type OrderReceived = {
  params: Promise<{
    id: string
  }>
}
const OrdenDeCompra = async (props: OrderReceived) => {
  const paymentMethod = 'Stripe'
  const params = await props.params
  const { id } = params
  const order = await getOrderById(id)
  if (!order) notFound()

  const totalPrice = order?.total || 0
    console.log('order', order)

  const session = await auth()
  
  console.log('props', params)
    let client_secret = null
    if (paymentMethod === 'Stripe' && !order.isPaid) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: 'MXN',
        metadata: { orderId: order._id },
      })
      client_secret = paymentIntent.client_secret
    }





  return (
    <main className='max-w-6xl mx-auto p-4'>
        <div className='flex mb-4'>
            <h3 className='font-bold'>Orden de compra:</h3>
            <span className='mx-1'>›</span>
            <p>{order._id}</p>
        </div>
        <div>
          <h4 className='font-bold text-center text-lg mb-6'>Detalles de la orden</h4>
           <div className='flex justify-between gap-4 rounded shadow'>
            <div className='bg-white p-4 '>
                
                <p><strong>Proveedor:</strong> {order.nameProvider}</p>
                <p><strong>Fecha de recepción:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total:</strong> {formatCurrency(order.total || 0)}</p>
                <p><strong>Observaciones:</strong> {order.observations || 'N/A'}</p>
            </div>

            <div className='w-[400] p-3'>
              <div className='flex justify-end'>
              {!order.isPaid && paymentMethod === 'Stripe' && (
              
                  <PaymentFormInterface
                    order={order}
                    paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
                    sessionRole={session?.user?.role}
                    clientSecret = { client_secret || "" }
                  />
                )
              }
              {
                order.isPaid && (
                  <p className='flex font-semibold text-green-700'>Orden Pagada <span className='ml-1'><CheckCircleIcon/></span></p>
                )
              }
              </div>
              
            </div>
          </div>
        </div>
       

        { order.products.length > 0 && (
                <div className='my-8 p-4 rounded shadow'>
                    <h2 className='text-primary font-bold'>Productos Ingresados</h2>
                    <div>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className='font-bold'>Nombre</TableHead>
                        <TableHead className='text-center font-bold'>ID de Producto</TableHead>
                        <TableHead className='text-center font-bold'>Categoria</TableHead>
                        <TableHead className='text-center font-bold'>Precio</TableHead>
                        <TableHead className='text-center font-bold'>Cantidad</TableHead>
                        <TableHead className='text-center font-bold'>Producto en Kg?</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.products.map((product, index) => (
                        <TableRow key={index}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className='text-center'>{product.productId}</TableCell>
                            <TableCell className='text-center'>{product.category}</TableCell>
                            <TableCell className='text-center'>{formatCurrency(product.listPrice)}</TableCell>
                            <TableCell className='text-center'>{product.countInStock}</TableCell>
                            <TableCell className='text-center'>{product.isProductKg ? 'Si' : 'No'}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    </div>
                </div>
                )
            }
        
        <div className='flex justify-end mt-10'>
            <div>
                <p className='text-xl font-bold text-right'>Subtotal: {formatCurrency(order.subtotal || 0)}</p>
                <p className='text-xl font-bold text-right'>IVA: {TAX_RATE}%</p>
                <p className='text-2xl font-bold text-right'>Total: {formatCurrency(totalPrice)}</p>
            </div>
        </div>
    </main>
  )
}
export default OrdenDeCompra

