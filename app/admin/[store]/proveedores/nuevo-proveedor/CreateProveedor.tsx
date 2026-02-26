'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useParams } from 'next/navigation'
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
import { Upload, AlertTriangle, CheckCircle2, Trash2, ArrowLeft, Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { ProveedorInputSchema } from '@/lib/validator'
import { createProveedor, checkRFCExists } from '@/lib/actions/proveedor.actions'
import { z } from 'zod'
import { Separator } from '@/components/ui/separator'

type ProviderFormValues = z.infer<typeof ProveedorInputSchema>

const CreateProveedor = () => {
  const router = useRouter()
  const params = useParams()
  const store = params.store as string
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
        const formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
        if (phoneValue !== formatted) {
          form.setValue('phone', formatted)
        }
      }
    }
  }, [phoneValue, form])


  const generateClave = () => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    form.setValue('clave', `PROV-${randomStr}`);
  }

  const onSubmit = async (data: ProviderFormValues) => {
    if (!data.rfc && !showRFCWarning) {
      setShowRFCWarning(true)
      toast.warning('Advertencia de RFC: Por favor confirma guardar sin RFC.')
      return
    }

    setIsPending(true)
    try {
      const res = await createProveedor(data)
      if (res.success) {
        toast.success('Proveedor creado exitosamente')
        form.reset()
        setShowRFCWarning(false)
        router.push(`/admin/${store}/proveedores`) // Redirect back to list
        router.refresh()
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-navy">Nuevo Proveedor</h2>
          <p className="text-gray-500">
            Complete la información para registrar un nuevo proveedor en el sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="bg-navy text-white hover:bg-navy-600">
            {isPending ? 'Guardando...' : (showRFCWarning ? 'Confirmar sin RFC' : 'Guardar Proveedor')}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex flex-col md:flex-row w-full gap-8">

            {/* Sidebar Tabs */}
            <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-1 justify-start min-w-[240px] sticky top-4">
              <div className="mb-4 px-2 hidden md:block">
                <h3 className="font-semibold text-navy">Secciones</h3>
              </div>
              <TabsTrigger value="basic" className="w-full justify-start px-4 py-3 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-lg transition-all">Información Básica</TabsTrigger>
              <TabsTrigger value="financial" className="w-full justify-start px-4 py-3 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-lg transition-all">Config. Compras</TabsTrigger>
              <TabsTrigger value="fiscal" className="w-full justify-start px-4 py-3 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-lg transition-all">Datos Fiscales</TabsTrigger>
              <TabsTrigger value="grocery" className="w-full justify-start px-4 py-3 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-lg transition-all">Tienda Abarrotes</TabsTrigger>
              <TabsTrigger value="docs" className="w-full justify-start px-4 py-3 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-medium rounded-lg transition-all">Documentos</TabsTrigger>

              {showRFCWarning && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                    <p className="text-xs text-yellow-800 font-medium">Atención requerida</p>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    Has intentado guardar sin RFC. Revisa la sección básica si esto no fue intencional.
                  </p>
                </div>
              )}
            </TabsList>

            {/* Content Area */}
            <div className="flex-1 max-w-3xl">
              <TabsContent value="basic" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-navy">Información Principal</h3>
                    <p className="text-sm text-gray-500">Datos esenciales para identificar al proveedor.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="nameProvider" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Proveedor <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="Ej. Coca-Cola" {...field} className="bg-gray-50/50" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="tradeName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Comercial</FormLabel>
                          <FormControl><Input placeholder="Ej. Refrescos del Norte S.A. de C.V." {...field} className="bg-gray-50/50" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="rfc" render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC <span className="text-gray-400 text-xs font-normal">(Opcional, pero recomendado)</span></FormLabel>
                        <div className="relative">
                          <FormControl><Input placeholder="RCO780915ABC" {...field} className="uppercase bg-gray-50/50" /></FormControl>
                          {rfcStatus === 'valid' && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
                          {rfcStatus === 'invalid' && <span className="absolute right-3 top-2.5 text-xs text-orange font-medium">Formato inválido</span>}
                        </div>
                        {rfcStatus === 'exists' && <FormDescription className="text-red-500 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Este RFC ya está registrado</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="clave" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clave Interna</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="Generar clave..." {...field} className="bg-gray-100 text-gray-500 font-mono" readOnly />
                            </FormControl>
                            <Button type="button" variant="outline" onClick={generateClave} className="shrink-0 text-navy hover:text-navy-600">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Generar
                            </Button>
                          </div>
                          <FormDescription>Clave única autogenerada.</FormDescription>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-navy">Datos de Contacto</h3>
                    <p className="text-sm text-gray-500">¿A quién llamamos para realizar pedidos?</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField control={form.control} name="mainContact" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Contacto Principal</FormLabel>
                        <FormControl><Input placeholder="Ej. Juan Pérez - Ventas" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="(81) 1234-5678" {...field} className="bg-gray-50/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl><Input placeholder="(81) 1234-5678" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl><Input type="email" placeholder="contacto@proveedor.com" {...field} className="bg-gray-50/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-navy">Logística y Pagos</h3>
                    <p className="text-sm text-gray-500">Acuerdos de entrega y crédito.</p>
                  </div>

                  <FormField control={form.control} name="deliveryDays" render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Días de Entrega</FormLabel>
                        <FormDescription>Selecciona los días que el proveedor visita la tienda.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {deliveryDaysOptions.map((day) => (
                          <FormField
                            key={day}
                            control={form.control}
                            name="deliveryDays"
                            render={({ field }) => {
                              return (
                                <FormItem key={day} className="flex flex-row items-center space-x-2 space-y-0 bg-gray-50/50 border border-gray-100 p-3 rounded-md hover:bg-gray-100 transition-colors">
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
                                  <FormLabel className="font-medium cursor-pointer text-sm w-full text-gray-700">
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

                  <Separator className="bg-gray-100" />

                  <div className="flex gap-4">
                    <FormField control={form.control} name="deliveryHoursStart" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Horario Inicio</FormLabel>
                        <FormControl><Input type="time" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="deliveryHoursEnd" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Horario Fin</FormLabel>
                        <FormControl><Input type="time" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Términos de Pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50/50"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
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
                        <FormControl><Input type="number" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="creditLimit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Límite de Crédito ($)</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-gray-50/50" /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-navy">Información Fiscal</h3>
                    <p className="text-sm text-gray-500">Datos para facturación.</p>
                  </div>
                  <FormField control={form.control} name="fiscalAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Fiscal</FormLabel>
                      <FormControl><Textarea placeholder="Calle, Número, Colonia, Ciudad..." {...field} className="bg-gray-50/50" /></FormControl>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl><Input placeholder="00000" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="fiscalRegime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Régimen Fiscal</FormLabel>
                        <FormControl><Input placeholder="Ej. Simplificado de Confianza" {...field} className="bg-gray-50/50" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="grocery" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-orange/5 rounded-lg border border-orange/10">
                    <div className="p-2 bg-orange/10 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-orange" />
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-800">Específico para Abarrotes</h3>
                      <p className="text-xs text-orange-700">Configuración crucial para manejo de mermas y caducidades.</p>
                    </div>
                  </div>

                  <FormField control={form.control} name="acceptsReturns" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm bg-gray-50/50">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-semibold text-navy">
                          Maneja cambios/devoluciones por caducidad
                        </FormLabel>
                        <FormDescription>
                          Habilita esta opción si el proveedor acepta retornar productos vencidos.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  {form.watch('acceptsReturns') && (
                    <div className="pl-6 border-l-2 border-gray-100 space-y-6">
                      <FormField control={form.control} name="returnPolicy" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Política de Cambios</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50/50"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="solo_cambios">Solo cambios (Físico por Físico)</SelectItem>
                              <SelectItem value="cambios_y_devoluciones">Cambios y Notas de Crédito</SelectItem>
                              <SelectItem value="no_acepta">No acepta cambios</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="daysBeforeExpiration" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Días aviso caducidad</FormLabel>
                            <FormDescription className="text-xs">Días antes de vencer para reportar.</FormDescription>
                            <FormControl><Input type="number" {...field} className="bg-gray-50/50" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="typicalExchangePercentage" render={({ field }) => (
                          <FormItem>
                            <FormLabel>% Típico de Cambios</FormLabel>
                            <FormDescription className="text-xs">Pre-llenado en nuevas compras.</FormDescription>
                            <FormControl><Input type="number" {...field} className="bg-gray-50/50" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  )}
                  <FormField control={form.control} name="mainCategories" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorías Principales</FormLabel>
                      <FormControl><Input placeholder="Refrescos, Lácteos, Botanas..." {...field} className="bg-gray-50/50" /></FormControl>
                      <FormDescription>Ayuda a clasificar automáticamente los productos.</FormDescription>
                    </FormItem>
                  )} />
                </div>
              </TabsContent>

              <TabsContent value="docs" className="space-y-6 mt-0 animate-in fade-in-50 duration-300">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-navy">Documentación</h3>
                    <p className="text-sm text-gray-500">Archivos adjuntos relacionados.</p>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Arrastra archivos aquí o haz clic para subir</p>
                    <p className="text-xs text-gray-500 mt-1">Cédula fiscal, Contratos, Identificaciones (Max 5MB)</p>

                    <Button variant="secondary" size="sm" className="mt-6" type="button" onClick={() => append({ type: 'otro', name: 'demo-doc.pdf', url: '#' })}>
                      Simular Subida
                    </Button>
                  </div>

                  {fields.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Archivos adjuntos ({fields.length})</h4>
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-navy">{field.name}</p>
                              <p className="text-xs text-gray-500 uppercase">{field.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}

export default CreateProveedor