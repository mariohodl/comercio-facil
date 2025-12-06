import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CompanySettingsModal from '@/components/shared/company-settings-modal'

export default async function AdminSetupPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/sign-in')
    }

    if (session.user.storeId && session.user.storeName) {
        redirect(`/admin/${session.user.storeId}/overview`)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <CompanySettingsModal isOpen={true} userId={session.user.id || ''} />
        </div>
    )
}
