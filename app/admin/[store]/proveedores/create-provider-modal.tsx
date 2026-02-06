'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger // Added if we want to use it as a trigger wrapper
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, Upload, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is used, or usetoast

import { ProveedorInputSchema } from '@/lib/validator'
import { createProveedor, checkRFCExists } from '@/lib/actions/proveedor.actions'
import { z } from 'zod'

type ProviderFormValues = z.infer<typeof ProveedorInputSchema>

interface CreateProviderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children?: React.ReactNode // To use as trigger if needed
    onSuccess?: () => void
}

export default function CreateProviderModal({ open, onOpenChange, children, onSuccess }: CreateProviderModalProps) {
    // const t = useTranslations('providers') // Eventually use translations
    const [isPending, setIsPending] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const [rfcStatus, setRfcStatus] = useState<'idle' | 'valid' | 'invalid' | 'exists'>('idle')
    const [showRFCWarning, setShowRFCWarning] = useState(false)

    const form = useForm<ProviderFormValues>({
        resolver: zodResolver(ProveedorInputSchema),
        defaultValues: {
            nameProvider: '',
            tradeName: '',
            rfc: '',
            clave: '',
            mainContact: '',
            phone: '',
            whatsapp: '',
            email: '',
            deliveryDays: [],
            deliveryHoursStart: '',
            deliveryHoursEnd: '',
            paymentTerms: 'contado',
            earlyPaymentDiscount: 0,
            creditLimit: 0,
            notes: '',
            acceptsReturns: true,
            returnPolicy: 'cambios_y_devoluciones',
            daysBeforeExpiration: 7,
            typicalExchangePercentage: 10,
            mainCategories: '',
            fiscalAddress: '',
            postalCode: '',
            fiscalRegime: '',
            documents: [],
            isActive: true
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "documents"
    });

    // Real-time RFC Validation
    const rfcValue = form.watch('rfc')
    useEffect(() => {
        if (!rfcValue) {
            setRfcStatus('idle')
            return
        }

        const cleanRFC = rfcValue.toUpperCase().trim()
        if (cleanRFC.length === 12 || cleanRFC.length === 13) {
            // Check existence in DB (debounce could be added here)
            const timeoutId = setTimeout(() => {
                checkRFCExists(cleanRFC).then(res => {
                    if (res.exists) {
                        setRfcStatus('exists')
                    } else {
                        setRfcStatus('valid')
                    }
                })
            }, 500)
            return () => clearTimeout(timeoutId)
        } else {
            setRfcStatus('invalid')
        }
    }, [rfcValue])

    // Phone Auto-formatting
    const phoneValue = form.watch('phone')
    useEffect(() => {
        if (phoneValue && phoneValue.length >= 10) {
            const cleaned = phoneValue.replace(/\D/g, '')
            if (cleaned.length === 10) {
                // (81) 1234-5678 format
                const formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
                if (phoneValue !== formatted) {
                    form.setValue('phone', formatted)
                }
            }
        }
    }, [phoneValue, form])


    const onSubmit = async (data: ProviderFormValues) => {
        if (!data.rfc && !showRFCWarning) {
            setShowRFCWarning(true)
            return // Stop first time to show warning
        }

        setIsPending(true)
        try {
            const res = await createProveedor(data)
            if (res.success) {
                toast.success('Proveedor creado exitosamente')
                form.reset()
                setShowRFCWarning(false)
                onOpenChange(false)
                if (onSuccess) onSuccess()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error('Ocurrió un error al crear el proveedor')
        } finally {
            setIsPending(false)
        }
    }

    const deliveryDaysOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-auto overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        ➕ NUEVO PROVEEDOR
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Sidebar Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full md:w-[200px] border-r bg-gray-50/50 flex flex-row md:flex-col overflow-x-auto md:overflow-visible shrink-0">
                                <TabsList className="flex md:flex-col h-auto bg-transparent p-2 gap-1 justify-start">
                                    <TabsTrigger value="basic" className="w-full justify-start px-3 py-2 text-sm">Información Básica</TabsTrigger>
                                    <TabsTrigger value="contact" className="w-full justify-start px-3 py-2 text-sm">Contacto</TabsTrigger>
                                    <TabsTrigger value="financial" className="w-full justify-start px-3 py-2 text-sm">Config. Compras</TabsTrigger>
                                    <TabsTrigger value="fiscal" className="w-full justify-start px-3 py-2 text-sm">Datos Fiscales</TabsTrigger>
                                    <TabsTrigger value="grocery" className="w-full justify-start px-3 py-2 text-sm">Tienda Abarrotes</TabsTrigger>
                                    <TabsTrigger value="docs" className="w-full justify-start px-3 py-2 text-sm">Documentos</TabsTrigger>
                                </TabsList>

                                {/* Content Area */}
                                <ScrollArea className="flex-1 p-6 h-[60vh] md:h-[600px]">
                                    <TabsContent value="basic" className="space-y-4 mt-0">
                                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
                                            <h3 className="font-semibold text-blue-900 mb-1">Información Principal</h3>
                                            <p className="text-xs text-blue-700">Ingrese los datos identificativos del proveedor.</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <FormField control={form.control} name="nameProvider" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre del Proveedor *</FormLabel>
                                                    <FormControl><Input placeholder="Ej. Coca-Cola" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="tradeName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre Comercial</FormLabel>
                                                    <FormControl><Input placeholder="Ej. Refrescos del Norte S.A. de C.V." {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="rfc" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>RFC *</FormLabel>
                                                    <div className="relative">
                                                        <FormControl><Input placeholder="RCO780915ABC" {...field} className="uppercase" /></FormControl>
                                                        {rfcStatus === 'valid' && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
                                                        {rfcStatus === 'invalid' && <span className="absolute right-3 top-2.5 text-xs text-orange font-medium">12-13 caracteres</span>}
                                                    </div>
                                                    {rfcStatus === 'exists' && <FormDescription className="text-red-500 font-medium">⚠️ Este RFC ya está registrado</FormDescription>}
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="contact" className="space-y-4 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="mainContact" render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Contacto Principal</FormLabel>
                                                    <FormControl><Input placeholder="Ej. Juan Pérez - Ventas" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="phone" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Teléfono *</FormLabel>
                                                    <FormControl><Input placeholder="(81) 1234-5678" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="whatsapp" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>WhatsApp</FormLabel>
                                                    <FormControl><Input placeholder="(81) 1234-5678" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Correo Electrónico</FormLabel>
                                                    <FormControl><Input type="email" placeholder="contacto@proveedor.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="financial" className="space-y-4 mt-0">
                                        <FormField control={form.control} name="deliveryDays" render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">Días de Entrega</FormLabel>
                                                    <FormDescription>Selecciona los días que el proveedor visita la tienda.</FormDescription>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {deliveryDaysOptions.map((day) => (
                                                        <FormField
                                                            key={day}
                                                            control={form.control}
                                                            name="deliveryDays"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem key={day} className="flex flex-row items-center space-x-2 space-y-0 bg-white border p-2 rounded-md">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(day)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), day])
                                                                                        : field.onChange(field.value?.filter((value) => value !== day))
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer text-xs w-full">
                                                                            {day}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </FormItem>
                                        )} />

                                        <div className="flex gap-4">
                                            <FormField control={form.control} name="deliveryHoursStart" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Horario Inicio</FormLabel>
                                                    <FormControl><Input type="time" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="deliveryHoursEnd" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Horario Fin</FormLabel>
                                                    <FormControl><Input type="time" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Términos de Pago</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="contado">Contado</SelectItem>
                                                            <SelectItem value="7_dias">7 días</SelectItem>
                                                            <SelectItem value="15_dias">15 días</SelectItem>
                                                            <SelectItem value="30_dias">30 días</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="earlyPaymentDiscount" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>% Desc. Pronto Pago</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="creditLimit" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Límite de Crédito ($)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </TabsContent>

                                    <TabsContent value="fiscal" className="space-y-4 mt-0">
                                        <FormField control={form.control} name="fiscalAddress" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección Fiscal</FormLabel>
                                                <FormControl><Textarea placeholder="Calle, Número, Colonia, Ciudad..." {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="postalCode" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Código Postal</FormLabel>
                                                    <FormControl><Input placeholder="00000" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="fiscalRegime" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Régimen Fiscal</FormLabel>
                                                    <FormControl><Input placeholder="Ej. Simplificado de Confianza" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="grocery" className="space-y-4 mt-0">
                                        <div className="bg-orange/10 p-4 rounded-lg border border-orange/20 mb-4">
                                            <h3 className="font-semibold text-orange mb-1">Configuración Abarrotes</h3>
                                            <p className="text-xs text-gray-600">Configura cómo maneja este proveedor las caducidades y cambios.</p>
                                        </div>

                                        <FormField control={form.control} name="acceptsReturns" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-white">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Este proveedor maneja cambios/devoluciones por caducidad
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )} />

                                        {form.watch('acceptsReturns') && (
                                            <>
                                                <FormField control={form.control} name="returnPolicy" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Política de Cambios</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="solo_cambios">Solo cambios (físico)</SelectItem>
                                                                <SelectItem value="cambios_y_devoluciones">Cambios y Notas de Crédito</SelectItem>
                                                                <SelectItem value="no_acepta">No acepta cambios</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="daysBeforeExpiration" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Días aviso caducidad</FormLabel>
                                                            <FormDescription className="text-xs">Días antes de vencer para reportar.</FormDescription>
                                                            <FormControl><Input type="number" {...field} /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="typicalExchangePercentage" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>% Típico de Cambios</FormLabel>
                                                            <FormDescription className="text-xs">Pre-llenado en nuevas compras.</FormDescription>
                                                            <FormControl><Input type="number" {...field} /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </>
                                        )}
                                        <FormField control={form.control} name="mainCategories" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categorías Principales</FormLabel>
                                                <FormControl><Input placeholder="Refrescos, Lácteos, Botanas..." {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </TabsContent>

                                    <TabsContent value="docs" className="space-y-4 mt-0">
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                            <p className="text-sm font-medium text-gray-700">Arrastra archivos aquí o haz clic para subir</p>
                                            <p className="text-xs text-gray-500 mt-1">Cédula fiscal, Contratos, etc. (Max 5MB)</p>
                                            {/* File Input implementation needed, for now just UI */}
                                            <Button variant="secondary" size="sm" className="mt-4" type="button" onClick={() => append({ type: 'otro', name: 'demo-doc.pdf', url: '#' })}>
                                                Simular Subida
                                            </Button>
                                        </div>

                                        {fields.length > 0 && (
                                            <div className="space-y-2">
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-100 p-2 rounded">
                                                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{field.name}</p>
                                                                <p className="text-xs text-gray-500 uppercase">{field.type}</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                                            <Trash2 className="h-4 w-4 text-red-400" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </div>

                        {showRFCWarning && (
                            <div className="mx-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-yellow-800 text-sm">Proveedor sin RFC</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Este proveedor no tiene RFC. No podrás emitir facturas ni deducir gastos correctamente.
                                        ¿Deseas continuar de todas formas?
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" variant="ghost" className="text-yellow-800 hover:bg-yellow-100" onClick={() => setShowRFCWarning(false)}>Cancelar</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mr-6 my-4 border-t pt-4">
                            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-navy hover:bg-navy-600">
                                {isPending ? 'Guardando...' : (showRFCWarning ? 'Guardar sin RFC' : 'Guardar Proveedor')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
