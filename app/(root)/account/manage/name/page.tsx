import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'

import { ProfileForm } from './profile-form'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

const PAGE_TITLE = 'Cambiar tu Nombre'
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
          <Link href='/account/manage'>Inicio de Sesión y Seguridad</Link>
          <span>›</span>
          <span>{PAGE_TITLE}</span>
        </div>
        <h1 className='h1-bold py-4'>{PAGE_TITLE}</h1>
        <Card className='max-w-2xl'>
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <p className='text-sm py-2'>
              Si quieres cambiar tu nombre asociado a tu cuenta de {APP_NAME}
              &apos;, puedes hacerlo en el campo de abajo. Asegúrate de hacer click en el botón Guardar Cambios cuando termines.
            </p>
            <ProfileForm />
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}