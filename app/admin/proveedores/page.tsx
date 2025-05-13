import { Metadata } from 'next'
import ProveedoresList from './proveedores-list'

export const metadata: Metadata = {
  title: 'Admin Proveedores',
}

export default async function AdminProveedores() {
  return <ProveedoresList />
}