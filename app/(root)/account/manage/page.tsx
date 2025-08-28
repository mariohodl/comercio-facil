import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const PAGE_TITLE = 'Inicio de Sesión y Seguridad'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}
export default async function ProfilePage() {
  const session = await auth()
  return (
    <div className='mb-24'>
      <SessionProvider session={session}>
        <div className='flex gap-2 '>
          <Link href='/account'>Mi Cuenta</Link>
          <span>›</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
        <Card className='max-w-2xl '>
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>Nombre</h3>
              <p>{session?.user.name}</p>
            </div>
            <div>
              <Link href='/account/manage/name'>
                <Button className='rounded-full w-32' variant='outline'>
                  Editar
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>Correo</h3>
              <p>{session?.user.email}</p>
              <p className="text-primary">will be implemented in the next version</p>
            </div>
            <div>
              <Link href='#'>
                <Button
                  disabled
                  className='rounded-full w-32'
                  variant='outline'
                >
                  Editar
                </Button>
              </Link>
            </div>
          </CardContent>
          <Separator />
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>Contraseña</h3>
              <p>************</p>
              <p className="text-primary">will be implemented in the next version</p>
            </div>
            <div>
              <Link href='#'>
                <Button
                  disabled
                  className='rounded-full w-32'
                  variant='outline'
                >
                  Editar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}