'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StoreSettingsSchema } from '@/lib/validator'
import { updateStoreSettings } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

import { useTranslations } from 'next-intl'

interface CompanySettingsModalProps {
    isOpen: boolean
    userId: string
}

export default function CompanySettingsModal({ isOpen }: CompanySettingsModalProps) {
    const [open, setOpen] = useState(isOpen)
    const [isLoading, setIsLoading] = useState(false)
    const { showSuccess, showError } = useToast()
    const router = useRouter()
    const { update } = useSession()
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')

    // Generate random 8-character alphanumeric store ID
    const generateStoreId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const form = useForm<z.infer<typeof StoreSettingsSchema>>({
        resolver: zodResolver(StoreSettingsSchema),
        defaultValues: {
            companyName: '',
            storeName: '',
            storeLocation: '',
            warehouseName: '',
            warehouseLocation: '',
            storeId: generateStoreId(),
            industry: 'general',
        },
    })

    useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    const onSubmit = async (data: z.infer<typeof StoreSettingsSchema>) => {
        setIsLoading(true)
        try {
            const res = await updateStoreSettings(data)
            if (res.success && res.data) {
                await update({
                    user: {
                        storeId: res.data.storeId,
                        storeName: res.data.storeName,
                        companyId: res.data.companyId,
                        companyName: res.data.companyName,
                        isStore: true
                    }
                })
                showSuccess(t('saveSuccess'))
                setOpen(false)
                router.push(`/admin/${data.storeId}/overview`)
            } else {
                showError(t('saveError'))
            }
        } catch (error) {
            console.error(error)
            showError(tCommon('unexpectedError'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{t('companySettingsTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('setupInstructions')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fields.companyName')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('placeholders.companyName')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="storeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.storeName')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('placeholders.storeName')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="storeLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.storeLocation')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('placeholders.storeLocation')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="warehouseName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.warehouseName')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('placeholders.warehouseName')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="warehouseLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.warehouseLocation')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('placeholders.warehouseLocation')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.industry')}</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="storeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fields.storeIdGenerated')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-100" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {tCommon('signOut')}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? tCommon('saving') : t('saveContinue')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
