import { Metadata } from 'next'
import { sendBasicEmail } from '@/emails'

export const metadata: Metadata = {
  title: 'send email',
}

export default async function AdminOrderReceived() {
    sendBasicEmail()
  return <div>
    <h2>Send basic email</h2>
  </div>
}