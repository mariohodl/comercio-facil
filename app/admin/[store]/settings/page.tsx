import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SettingsContent from './settings-content';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('settings');
    return {
        title: t('pageTitle'),
    };
}

export default async function SettingsPage() {
    return <SettingsContent />;
}
