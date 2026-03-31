import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CompanySettingsModal from '@/components/shared/company-settings-modal'
import SessionSync from '@/components/shared/session-sync'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'

export default async function AdminSetupPage(props: {
    searchParams: Promise<{ verified?: string }>
}) {
    const session = await auth()

    if (!session?.user) {
        redirect('/sign-in')
    }

    // 1. Check if user is already verified in DB (absolute truth)
    await connectToDatabase()
    const dbUser = await User.findById(session.user.id)
        .populate('business.defaultStoreId')
        .lean() as any

    // 2. If verified in DB but session says false, force sync ONE TIME
    const searchParams = await props.searchParams
    const isAlreadySyncing = searchParams?.verified === '1'

    if (dbUser?.phoneVerified) {
        const storeId = session.user.storeId || dbUser.business?.defaultStoreId?.slug
        if (storeId) {
            // If we are already syncing/verified in URL, don't show SessionSync again to avoid loops
            if (isAlreadySyncing) {
                redirect(`/admin/${storeId}/overview?verified=1`)
            }
            
            return (
                <div className="flex items-center justify-center min-h-screen bg-white">
                    <SessionSync redirectUrl={`/admin/${storeId}/overview`} />
                </div>
            )
        }
    }

    // 3. Normal redirects (if synced)
    if (session?.user?.storeId && session?.user?.storeName && session?.user?.phoneVerified) {
        redirect(`/admin/${session.user.storeId}/overview`)
    }

    if (session?.user?.role === 'Seller' && session?.user?.storeId) {
        redirect(`/admin/pos/${session.user.storeId}`)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <CompanySettingsModal isOpen={true} userId={session.user.id || ''} />
        </div>
    )
}
