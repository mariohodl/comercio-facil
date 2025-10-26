import { Metadata } from 'next'
import Component from './report-statsBOLT'

export const metadata: Metadata = {
  title: 'Admin Reporte de Movimientos',
}

export default async function AdminProveedores() {
  return <div>
    <Component />
  </div>
}