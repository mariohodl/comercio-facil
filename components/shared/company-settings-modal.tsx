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

import { useSession } from 'next-auth/react'

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
            if (res.success) {
                await update({
                    user: {
                        storeId: data.storeId,
                        storeName: data.storeName,
                        isStore: true
                    }
                })
                showSuccess('Company settings updated successfully')
                setOpen(false)
                router.push(`/admin/${data.storeId}/overview`)
            } else {
                showError(res.error || 'Something went wrong')
            }
        } catch (error) {
            console.error(error)
            showError('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Configuración de la Empresa</DialogTitle>
                    <DialogDescription>
                        Por favor completa los datos de tu empresa, sucursal principal y almacén para continuar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Empresa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mi Empresa S.A. de C.V." {...field} />
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
                                        <FormLabel>Sucursal Principal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sucursal Centro" {...field} />
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
                                        <FormLabel>Ubicación Sucursal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Av. Reforma 123" {...field} />
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
                                        <FormLabel>Almacén Principal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Almacén General" {...field} />
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
                                        <FormLabel>Ubicación Almacén</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Calle Industrial 456" {...field} />
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
                                        <FormLabel>Giro de la Empresa</FormLabel>
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
                                        <FormLabel>ID de la Sucursal (Generado)</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-100" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar y Continuar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
