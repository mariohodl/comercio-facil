'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Upload, Loader2, Info } from 'lucide-react';
import { updateCompanyLogo, getCompanyLogoUpdateInfo } from '@/lib/actions/user.actions';
import { UploadButton } from '@/lib/uploadthing';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProfilePhotoUpdateInfo {
    remainingUpdates: number;
    totalUpdates: number;
    nextAvailableDate: string | null;
    currentImage: string | null;
}

export default function CompanyLogoUpload() {
    const t = useTranslations('settings');
    const locale = useLocale();
    const [uploading, setUploading] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<ProfilePhotoUpdateInfo | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUpdateInfo();
    }, []);

    const loadUpdateInfo = async () => {
        try {
            setLoading(true);
            const result = await getCompanyLogoUpdateInfo();
            if (result.success && result.data) {
                setUpdateInfo(result.data);
            }
        } catch (error) {
            console.error('Error loading profile photo info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpdate = async (imageUrl: string) => {
        try {
            setUploading(true);
            setMessage(null);

            const result = await updateCompanyLogo(imageUrl);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `${t('companyLogo.updateSuccess')} ${result.remainingUpdates} ${t('companyLogo.updatesRemaining')}`
                });
                await loadUpdateInfo();
            } else {
                if (result.error === 'LIMIT_REACHED' && result.nextAvailableDate) {
                    const date = new Date(result.nextAvailableDate).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                    setMessage({
                        type: 'error',
                        text: `${t('companyLogo.limitReached')} ${t('companyLogo.nextAvailable')}: ${date}`
                    });
                } else {
                    setMessage({ type: 'error', text: result.error || t('companyLogo.updateError') });
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('companyLogo.updateError') });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
        );
    }

    const canUpdate = updateInfo && updateInfo.remainingUpdates > 0;
    const nextAvailableDate = updateInfo?.nextAvailableDate
        ? new Date(updateInfo.nextAvailableDate).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-base font-semibold">{t('companyLogo.title')}</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('companyLogo.description')}
                </p>
            </div>

            {/* Current Photo Display */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className={cn(
                        "w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center",
                        updateInfo?.currentImage && "border-orange-200 dark:border-orange-800"
                    )}>
                        {updateInfo?.currentImage ? (
                            <Image
                                src={updateInfo.currentImage}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <Building2 className="h-10 w-10 text-gray-400" />
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    {canUpdate ? (
                        <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                    handleLogoUpdate(res[0].url);
                                }
                            }}
                            onUploadError={(error: Error) => {
                                setMessage({ type: 'error', text: error.message });
                            }}
                            appearance={{
                                button: "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm",
                                allowedContent: "text-xs text-gray-500 dark:text-gray-400"
                            }}
                            content={{
                                button({ ready }) {
                                    if (ready) return (
                                        <div className="flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            {t('companyLogo.uploadButton')}
                                        </div>
                                    );
                                    return t('common.loading');
                                },
                                allowedContent({ ready, fileTypes, isUploading }) {
                                    if (!ready) return t('common.loading');
                                    if (isUploading) return t('companyLogo.uploading');
                                    return t('companyLogo.allowedFormats');
                                }
                            }}
                        />
                    ) : (
                        <Button disabled variant="outline" className="cursor-not-allowed">
                            <Upload className="h-4 w-4 mr-2" />
                            {t('companyLogo.uploadButton')}
                        </Button>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {t('companyLogo.sizeLimit')}
                    </p>
                </div>
            </div>

            {/* Update Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {t('companyLogo.limitInfo')}
                        </p>
                        <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                            <p>
                                • {t('companyLogo.remainingUpdates')}: <span className="font-semibold">{updateInfo?.remainingUpdates || 0}/3</span>
                            </p>
                            {!canUpdate && nextAvailableDate && (
                                <p className="text-red-600 dark:text-red-400 font-medium">
                                    • {t('companyLogo.nextAvailable')}: {nextAvailableDate}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
