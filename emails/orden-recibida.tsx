import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Html,
    // Img,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
  } from '@react-email/components'
//   import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
//   } from '@/components/ui/table' we cant use this one because they are client comp
  
  import { formatCurrency } from '@/lib/utils'
  import { IOrderReception } from '@/lib/db/models/orderReception.model'
  import { formatDateTime } from '@/lib/utils'
//   import { SERVER_URL } from '@/lib/constants'
//   import Link from 'next/link'
  
  type OrderInformationProps = { 
    order: IOrderReception
  }
  
  OrderReceiptEmail.PreviewProps = {
    order: {
      _id: 'G83fb0d9adc61f3b19718526',
      createdAt: new Date(),
      nameProvider: "Surtidora de carne el Farolito",
      clave: 'S43ddfvd',
      facturaNumber: 'd32dcsfs',
      rfc: 'GOMM34r23fjdf4',
      observations: 'La carne llega fresca y en tiempo anunciado. Embarque sellado y abiert…',
      paidAt: new Date(),
      isPaid: false,
      products: [
        {
            name: 'Pechuga de pollo sin hueso',
            productId: "2",
            countInStock: 78,
            listPrice: 22.5,
            category: 'Pollo',
            isProductKg: true,
        },
        {
            name: 'Arrachera marinada',
            productId: "6",
            countInStock: 178,
            listPrice: 52.5,
            category: 'Res',
            isProductKg: true,
        },
        {
            name: 'Cabeza de cerdo',
            productId: "4",
            countInStock: 122,
            listPrice: 43.5,
            category: 'Cerdo',
            isProductKg: false,
        },
        {
            name: 'Patas de ganzo',
            productId: "2",
            countInStock: 78,
            listPrice: 22.5,
            category: 'Aves especiales',
            isProductKg: false,
        }
      ],
      total: 1160,
      subtotal: 1000,
      iva: 0.16
    } as IOrderReception,
  } satisfies OrderInformationProps
//   const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
  
  export default async function OrderReceiptEmail({
    order,
  }: OrderInformationProps) {
    return (
      <Html>
        <Preview>Ver Orden recibida</Preview>
        <Tailwind>
          <Head />
          <Body className='font-sans bg-white'>
            <Container className='max-w-6xl'>
              <Heading className='text-center'>Orden de compra recibida</Heading>
                {/* <br /> */}
                {/* <br /> */}
                {/* <span className='flex mb-1'>
                    <span className='font-bold'>Orden de compra: </span>
                    <span>{order._id}</span>
                </span> */}
              <Section className='mb-4'>
                <Row>
                    <Column>
                        <span className='flex mb-1'>
                            <span className='font-bold'>Proveedor: </span>
                            <span>{order.nameProvider}</span>
                        </span>
                        <span className='flex mb-1'>
                            <span className='font-bold'>Fecha de recepción: </span>
                            <span>{formatDateTime(order.createdAt).dateOnly}</span>
                        </span>
                        <span className='flex'>
                            <span className='font-bold'>Observaciones: </span>
                            <span>{order.observations}</span>
                        </span>
                    </Column>

                    <Column>
                        {
                            order.isPaid ? (<span className='text-green-700 font-bold text-lg'>Pagada</span>) : (<span className='text-red-700 font-bold text-lg'>No Pagada</span>)
                        }
                    </Column>
                    
                </Row>
              </Section>
              {/* <br /> */}
              {/* <br /> */}
              <Section className='border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4'>
                <Row>
                    <Text className='font-bold text-lg'>Productos Ingresados</Text>
                </Row>
                <Row className='mt-2'>
                    <div>
                        <div>
                            <div className='flex justify-between'>
                                <div className='font-bold w-64'>Nombre</div>
                                <div className='text-center font-bold w-24'>ID </div>
                                <div className='text-center font-bold'>Categoria</div>
                                <div className='text-center font-bold'>Precio</div>
                                <div className='text-center font-bold'>Cantidad</div>
                                <div className='text-center font-bold'>Producto en Kg?</div>
                            </div>
                        </div>
                        <div>
                            {order.products.map((product, index) => (
                            <div key={index} className='flex justify-between'>
                                <div className='w-64'>{product.name}</div>
                                <div className='text-center w-24'>{product.productId}</div>
                                <div className='text-center'>{product.category}</div>
                                <div className='text-center'>{formatCurrency(product.listPrice)}</div>
                                <div className='text-center'>{product.countInStock}</div>
                                <div className='text-center'>{product.isProductKg ? 'Si' : 'No'}</div>
                            </div>
                            ))}
                        </div>
                    </div>
                </Row>
                {/* <br /> */}
                {/* <br /> */}
                <Row>
                    <div className='flex justify-end'>
                        <div>
                            <p className='font-bold text-lg m-0'>Subtotal: {formatCurrency(order.subtotal || 0)}</p>
                            <p className='font-bold text-lg m-0'>IVA: {order.iva}%</p>
                            <p className='font-bold text-lg m-0'>Total: {formatCurrency(order.total || 0)}</p>
                        </div>
                    </div>
                </Row>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    )
  }