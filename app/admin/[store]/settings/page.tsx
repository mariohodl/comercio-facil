import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SettingsContent from './settings-content';
import { auth } from '@/auth';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('settings');
    return {
        title: t('pageTitle'),
    };
}

export default async function SettingsPage() {
    const session = await auth()

    if (session?.user.role === 'Seller') {
        const { redirect } = await import('next/navigation')
        redirect(`/admin/pos/${session.user.storeId}`)
    }

    if (session?.user.role !== 'Admin' && session?.user.role !== 'SuperAdmin') {
        throw new Error('Admin permission required')
    }

    return <SettingsContent />;
}
