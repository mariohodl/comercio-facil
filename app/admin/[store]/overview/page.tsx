import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { auth } from '@/auth'
export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()

  if (session?.user.role === 'Seller') {
    // Sellers should only see the POS, redirect them automatically
    const { redirect } = await import('next/navigation')
    redirect(`/admin/pos/${session.user.storeId}`)
  }

  if (session?.user.role !== 'Admin' && session?.user.role !== 'SuperAdmin') {
    throw new Error('Admin permission required')
  }

  return <OverviewReport />
}

export default DashboardPage