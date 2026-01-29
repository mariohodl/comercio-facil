'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { getStoreSettings, updateStoreSettings } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Building2,
    Store,
    Warehouse,
    CreditCard,
    FileText,
    Calendar,
    Crown,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CompanyLogoUpload from './company-logo-upload';

interface SettingsData {
    companyName: string;
    storeName: string;
    storeLocation: string;
    warehouseName: string;
    warehouseLocation: string;
    storeId: string;
    taxId: string;
    industry: string;
    plan: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    planStatus: string;
    trialEndDate: string | null;
    subscriptionEndDate: string | null;
}

type SettingsSection = 'profile' | 'store' | 'warehouse' | 'billing';

export default function SettingsContent() {
    const t = useTranslations('settings');
    const params = useParams();
    const storeId = params.store as string;

    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState<SettingsData>({
        companyName: '',
        storeName: '',
        storeLocation: '',
        warehouseName: '',
        warehouseLocation: '',
        storeId: '',
        taxId: '',
        industry: 'general',
        plan: 'BASIC',
        planStatus: 'FREE_TRIAL',
        trialEndDate: null,
        subscriptionEndDate: null,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const result = await getStoreSettings();
            if (result.success && result.data) {
                setFormData(result.data as SettingsData);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const result = await updateStoreSettings(formData);
            if (result.success) {
                setMessage({ type: 'success', text: t('saveSuccess') });
            } else {
                setMessage({ type: 'error', text: result.error || t('saveError') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('saveError') });
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: keyof SettingsData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'ADVANCED':
                return 'bg-gradient-to-r from-purple-500 to-pink-500';
            case 'INTERMEDIATE':
                return 'bg-gradient-to-r from-blue-500 to-cyan-500';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'text-green-600';
            case 'FREE_TRIAL':
                return 'text-blue-600';
            case 'EXPIRED':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getDaysRemaining = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const sections = [
        { id: 'profile' as SettingsSection, label: t('sections.profile'), icon: Building2 },
        { id: 'store' as SettingsSection, label: t('sections.store'), icon: Store },
        { id: 'warehouse' as SettingsSection, label: t('sections.warehouse'), icon: Warehouse },
        { id: 'billing' as SettingsSection, label: t('sections.billing'), icon: CreditCard, highlight: true },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto  max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                                            section.highlight && !isActive && 'border border-orange-200 dark:border-orange-800'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5" />
                                            <span>{section.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {activeSection === 'profile' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {t('sections.profile')}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('profileDescription')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <CompanyLogoUpload />

                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="companyName">{t('fields.companyName')}</Label>
                                            <Input
                                                id="companyName"
                                                value={formData.companyName}
                                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                placeholder={t('placeholders.companyName')}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="industry">Giro de la Empresa</Label>
                                            <select
                                                id="industry"
                                                value={formData.industry}
                                                onChange={(e) => handleInputChange('industry', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                                            >
                                                <option value="general">General</option>
                                                <option value="farmacia">Farmacia</option>
                                                <option value="abarrotes">Abarrotes</option>
                                                <option value="ferreteria">Ferretería</option>
                                                <option value="ropa">Ropa y Calzado</option>
                                                <option value="tienda-de-conveniencia">Tienda de Conveniencia</option>
                                                <option value="papeleria">Papelería</option>
                                                <option value="cosmeticos">Cosméticos y Belleza</option>
                                                <option value="electronica">Electrónica y Computación</option>
                                                <option value="jugueteria">Juguetería</option>
                                                <option value="libreria">Librería</option>
                                                <option value="mascotas">Mascotas y Veterinaria</option>
                                                <option value="deportes">Artículos Deportivos</option>
                                                <option value="alimentos-preparados">Restaurante / Alimentos Preparados</option>
                                                <option value="panaderia">Panadería y Pastelería</option>
                                                <option value="carniceria">Carnicería</option>
                                                <option value="frutas-verduras">Frutas y Verduras</option>
                                                <option value="automotriz">Automotriz y Autopartes</option>
                                                <option value="muebleria">Mueblería y Hogar</option>
                                                <option value="tecnologia">Tecnología y Gadgets</option>
                                                <option value="regalos">Tienda de Regalos</option>
                                                <option value="joyeria">Joyería y Relojería</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="taxId">{t('fields.taxId')}</Label>
                                        <div className="relative mt-1.5">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="taxId"
                                                value={formData.taxId}
                                                onChange={(e) => handleInputChange('taxId', e.target.value)}
                                                placeholder={t('placeholders.taxId')}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Store Section */}
                        {activeSection === 'store' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {t('sections.store')}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('storeDescription')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="storeName">{t('fields.storeName')}</Label>
                                        <Input
                                            id="storeName"
                                            value={formData.storeName}
                                            onChange={(e) => handleInputChange('storeName', e.target.value)}
                                            placeholder={t('placeholders.storeName')}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="storeLocation">{t('fields.storeLocation')}</Label>
                                        <Input
                                            id="storeLocation"
                                            value={formData.storeLocation}
                                            onChange={(e) => handleInputChange('storeLocation', e.target.value)}
                                            placeholder={t('placeholders.storeLocation')}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="storeId">{t('fields.storeId')}</Label>
                                        <Input
                                            id="storeId"
                                            value={formData.storeId}
                                            onChange={(e) => handleInputChange('storeId', e.target.value)}
                                            placeholder={t('placeholders.storeId')}
                                            className="mt-1.5"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t('storeIdHelp')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Warehouse Section */}
                        {activeSection === 'warehouse' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Warehouse className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {t('sections.warehouse')}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('warehouseDescription')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="warehouseName">{t('fields.warehouseName')}</Label>
                                        <Input
                                            id="warehouseName"
                                            value={formData.warehouseName}
                                            onChange={(e) => handleInputChange('warehouseName', e.target.value)}
                                            placeholder={t('placeholders.warehouseName')}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="warehouseLocation">{t('fields.warehouseLocation')}</Label>
                                        <Input
                                            id="warehouseLocation"
                                            value={formData.warehouseLocation}
                                            onChange={(e) => handleInputChange('warehouseLocation', e.target.value)}
                                            placeholder={t('placeholders.warehouseLocation')}
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing Section */}
                        {activeSection === 'billing' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                <Crown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                    {t('sections.billing')}
                                                </h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('billingDescription')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn('px-4 py-2 rounded-full text-white text-sm font-medium', getPlanBadgeColor(formData.plan))}>
                                            {formData.plan}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Plan Status */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                {formData.planStatus === 'ACTIVE' ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                ) : formData.planStatus === 'EXPIRED' ? (
                                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                                )}
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {t('fields.planStatus')}
                                                </span>
                                            </div>
                                            <p className={cn('text-lg font-semibold', getStatusColor(formData.planStatus))}>
                                                {t(`planStatuses.${formData.planStatus}`)}
                                            </p>
                                        </div>

                                        {/* Expiration Date */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {formData.planStatus === 'FREE_TRIAL' ? t('fields.trialEndDate') : t('fields.subscriptionEndDate')}
                                                </span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatDate(formData.planStatus === 'FREE_TRIAL' ? formData.trialEndDate : formData.subscriptionEndDate)}
                                            </p>
                                            {(() => {
                                                const days = getDaysRemaining(formData.planStatus === 'FREE_TRIAL' ? formData.trialEndDate : formData.subscriptionEndDate);
                                                if (days !== null && days > 0) {
                                                    return (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {days} {t('daysRemaining')}
                                                        </p>
                                                    );
                                                } else if (days !== null && days <= 0) {
                                                    return (
                                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                            {t('expired')}
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Plan Features */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {t('currentPlanFeatures')}
                                    </h3>
                                    <div className="space-y-3">
                                        {formData.plan === 'BASIC' && (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.basic.feature1')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.basic.feature2')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.basic.feature3')}</span>
                                                </div>
                                            </>
                                        )}
                                        {formData.plan === 'INTERMEDIATE' && (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.intermediate.feature1')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.intermediate.feature2')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.intermediate.feature3')}</span>
                                                </div>
                                            </>
                                        )}
                                        {formData.plan === 'ADVANCED' && (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.advanced.feature1')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.advanced.feature2')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{t('features.advanced.feature3')}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Upgrade CTA */}
                                {formData.plan !== 'ADVANCED' && (
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">{t('upgradeCTA.title')}</h3>
                                                <p className="text-purple-100">{t('upgradeCTA.description')}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                                            >
                                                {t('upgradeCTA.button')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {message && (
                            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}

                        {activeSection !== 'billing' && (
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={loadSettings}
                                    disabled={saving}
                                >
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('actions.saving')}
                                        </>
                                    ) : (
                                        t('actions.save')
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
