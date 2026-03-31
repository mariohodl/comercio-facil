'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SessionSync({ redirectUrl }: { redirectUrl: string }) {
    const { update } = useSession()
    const router = useRouter()

    useEffect(() => {
        const sync = async () => {
            console.log('SYNC: Silent refresh...')
            try {
                // We call update to tell NextAuth to fetch new session
                await update()
                
                // We use window.location.href for a full reload to ensure middleware catches the NEW cookie
                // NextAuth cookie writes need a browser-level refresh often for 100% reliability in prod
                window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'verified=1'
            } catch (error) {
                console.error('SYNC error:', error)
                // Fallback to direct redirect if update fails
                window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'verified=1'
            }
        }
        sync()
    }, [update, redirectUrl])

    // Return nothing or a very minimal loader to avoid UI flashes
    return null
}
