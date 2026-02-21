'use client'

import React, { useState, useTransition, useMemo, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
    Plus,
    Trash2,
    Search,
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    ShoppingCart,
    Receipt,
    Truck,
    AlertCircle,
    ScanBarcode,
    ClipboardCopy,
    ArrowRightLeft,
    Undo2,
    Save,
    Image as ImageIcon,
    X,
    FileText,
    UploadCloud,
    Info
} from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { ProductModal } from '@/components/shared/product-modal'
import { HelpTooltip } from '@/components/shared/help-tooltip'

import { cn, formatCurrency } from '@/lib/utils'
import { UploadButton, useUploadThing } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { PurchaseInputSchema } from '@/lib/validator'
import { createPurchase, updatePurchase } from '@/lib/actions/purchase.actions'
import { IProveedor } from '@/lib/db/models/proveedor.model'
import { IProduct } from '@/lib/db/models/product.model'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

import { usePurchaseFormStore } from '@/hooks/use-purchase-form-store'

interface PurchaseFormProps {
    storeId: string
    suppliers: IProveedor[]
    products: IProduct[]
    initialData?: any
}

const PurchaseForm = ({ storeId, suppliers, products, initialData }: PurchaseFormProps) => {
    const t = useTranslations('purchases')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Zustand store actions and state selectors
    const storedProducts = usePurchaseFormStore(state => state.products)
    const updateFormData = usePurchaseFormStore(state => state.updateFormData)
    const clearFormData = usePurchaseFormStore(state => state.clearFormData)

    // Get stored form data once for initialization without subscribing to its changes
    // this prevents the component from re-rendering when it auto-saves to the store
    const [storedFormData] = useState(() => usePurchaseFormStore.getState().formData)

    const [productSearchOpen, setProductSearchOpen] = useState(false)
    const [supplierSearchOpen, setSupplierSearchOpen] = useState(false)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)

    // Merge initial products with stored products, preferring stored ones
    const [localProducts, setLocalProducts] = useState<IProduct[]>(() => {
        const productMap = new Map<string, IProduct>()
        products.forEach(p => productMap.set(p._id, p))
        storedProducts.forEach(p => productMap.set(p._id, p))
        return Array.from(productMap.values())
    })

    // Update localProducts when storedProducts changes (e.g., when a new product is added)
    useEffect(() => {
        const productMap = new Map<string, IProduct>()
        products.forEach(p => productMap.set(p._id, p))
        storedProducts.forEach(p => productMap.set(p._id, p))
        setLocalProducts(Array.from(productMap.values()))
    }, [storedProducts, products])

    // Restore form data from store or use defaults
    const defaultValues = initialData ? {
        ...initialData,
        purchaseDate: new Date(initialData.purchaseDate),
        supplierId: initialData.supplierId?._id || initialData.supplierId || 'internal',
    } : storedFormData && storedFormData.storeId === storeId ? {
        // Restore from stored data if it's for the same store
        ...storedFormData,
        purchaseDate: storedFormData.purchaseDate ? new Date(storedFormData.purchaseDate) : new Date(),
    } : {
        supplierId: '',
        reference: `PUR-${uuidv4().substring(0, 8).toUpperCase()}`,
        purchaseDate: new Date(),
        status: 'Pending' as const,
        type: 'Normal' as const,
        items: [],
        totalAmount: 0,
        paidAmount: 0,
        paymentStatus: 'Unpaid' as const,
        notes: '',
        storeId: storeId,
        attachments: [],
    }

    const form = useForm({
        resolver: zodResolver(PurchaseInputSchema),
        defaultValues,
    })

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Watch items to calculate total
    const watchedItems = (form.watch('items') as any[]) || []
    const totalAmount = useMemo(() => {
        return watchedItems.reduce((acc, item) => {
            // All types now contribute positively to the total based on their calculated subtotal.
            // 'Replacement' (Normal Purchase): full cost.
            // 'Exchange' (Purchase with Exchanges): (Qty - Free) * Cost.
            // 'Return' (Only Replacement): 0 cost since Free = Qty.
            return acc + (item.subtotal || 0)
        }, 0)
    }, [watchedItems])

    // Auto-update purchase type based on items
    useEffect(() => {
        if (watchedItems.length === 0) return

        const hasExchange = watchedItems.some(i => i.entryType === 'Exchange')
        const hasReturn = watchedItems.some(i => i.entryType === 'Return')

        if (hasExchange) {
            form.setValue('type', 'WithExchanges')
        } else if (hasReturn) {
            form.setValue('type', 'OnlyReplacement')
        } else {
            form.setValue('type', 'Normal')
        }
    }, [watchedItems, form])

    // Update totalAmount and sync paidAmount if it matches the total
    useEffect(() => {
        const prevTotal = form.getValues('totalAmount')
        const currentPaid = form.getValues('paidAmount')

        form.setValue('totalAmount', totalAmount)

        // Auto-sync paidAmount if it was already synced with the total
        if (currentPaid === prevTotal || currentPaid === 0) {
            form.setValue('paidAmount', totalAmount)
        }
    }, [totalAmount, form])

    // Auto-update payment status based on paid amount
    const paidAmount = form.watch('paidAmount')
    const currentStatus = form.watch('paymentStatus')

    useEffect(() => {
        if (totalAmount === 0) return

        if (paidAmount >= totalAmount) {
            if (currentStatus !== 'Paid') {
                form.setValue('paymentStatus', 'Paid')
            }
        } else if (paidAmount > 0) {
            if (currentStatus === 'Unpaid' || currentStatus === 'Paid') {
                form.setValue('paymentStatus', 'Partial')
            }
        } else if (paidAmount === 0) {
            if (currentStatus === 'Paid' || currentStatus === 'Partial') {
                form.setValue('paymentStatus', 'Unpaid')
            }
        }
    }, [paidAmount, totalAmount, currentStatus, form])

    // Watch all form values to persist them
    const allFormValues = form.watch()

    // Debounced effect to persist form data
    useEffect(() => {
        if (initialData) return

        const timeoutId = setTimeout(() => {
            updateFormData(allFormValues)
        }, 1000) // Save every 1 second of inactivity

        return () => clearTimeout(timeoutId)
    }, [allFormValues, updateFormData, initialData])

    const onSubmit = async (values: any) => {
        startTransition(async () => {
            try {
                let res;
                if (initialData) {
                    res = await updatePurchase({ ...values, _id: initialData._id })
                } else {
                    res = await createPurchase(values)
                }

                if (res.success) {
                    showSuccess(initialData ? t('updatePurchaseSuccess') : t('createPurchaseSuccess'))
                    // Clear persistent store on success
                    if (!initialData) {
                        clearFormData()
                    }
                    router.push(`/admin/${storeId}/purchases`)
                } else {
                    showError(res.message)
                }
            } catch (error: any) {
                showError(error.message)
            }
        })
    }

    const [showHelp, setShowHelp] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalQuantity, setModalQuantity] = useState(1)
    const [modalFreeQuantity, setModalFreeQuantity] = useState(0)
    const [modalCost, setModalCost] = useState(0)
    const [modalEntryType, setModalEntryType] = useState('Replacement')
    const [modalReason, setModalReason] = useState('')
    const [showFreeQtyError, setShowFreeQtyError] = useState(false)
    const [isNotesCollapsed, setIsNotesCollapsed] = useState(true)
    const [isVoucherCollapsed, setIsVoucherCollapsed] = useState(true)

    const handleOpenProductModal = (product: IProduct) => {
        setSelectedProduct(product)
        setModalQuantity(1)
        setModalFreeQuantity(0)
        setModalCost(product.costPerUnit || 0)
        setModalEntryType('Replacement')
        setModalReason('Expired')
        setShowFreeQtyError(false)
        setModalOpen(true)
        setProductSearchOpen(false)
    }

    // Reset free quantity when entry type changes
    useEffect(() => {
        if (modalEntryType !== 'Exchange') {
            setModalFreeQuantity(0)
            setShowFreeQtyError(false)
        }
    }, [modalEntryType])

    const handleConfirmAddProduct = () => {
        if (!selectedProduct) return

        if (modalEntryType === 'Exchange') {
            if (modalFreeQuantity <= 0) {
                setShowFreeQtyError(true)
                return
            }
            if (modalFreeQuantity > modalQuantity) {
                // Should be prevented by input max, but double check
                setModalFreeQuantity(modalQuantity)
                return
            }
        }

        const qty = Math.max(1, modalQuantity)
        // Ensure free quantity doesn't exceed total quantity
        // For 'Return' (Only Replacement), it always equals total quantity.
        const freeQty = modalEntryType === 'Return' ? qty : Math.min(Math.max(0, modalFreeQuantity), qty)
        const cost = Math.max(0.01, modalCost)

        // Calculate subtotal: (Total - Free) * Cost
        const subtotal = (qty - freeQty) * cost

        append({
            productId: selectedProduct._id,
            name: selectedProduct.name,
            quantity: qty,
            freeQuantity: freeQty,
            costPrice: cost,
            subtotal: subtotal,
            entryType: modalEntryType,
            reason: modalEntryType !== 'Replacement' ? modalReason : undefined,
        })

        setModalOpen(false)
        setSelectedProduct(null)
    }

    // --- Scanner Logic ---
    const [scanBuffer, setScanBuffer] = useState('')

    // Listen for barcode scanner input (global keypress)
    // Note: This is a simple implementation. For robust scanning, we might need a dedicated hidden input or timing logic.
    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            // Ignore if focus is on an input or textarea (except if it's our designated scanner input, but here we do global for simplicity)
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

            if (e.key === 'Enter') {
                if (scanBuffer) {
                    // Search product
                    const product = products.find(p => p.sku === scanBuffer || p.itemBarcode === scanBuffer)
                    if (product) {
                        handleOpenProductModal(product)
                    } else {
                        // Product not found logic (e.g., toast or open create modal)
                        showError(t('productNotFound', { sku: scanBuffer }))
                    }
                    setScanBuffer('')
                }
            } else if (e.key.length === 1) {
                setScanBuffer(prev => prev + e.key)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [scanBuffer, products, t, showError])

    const handleManualScan = (e: ReactKeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const value = e.currentTarget.value
            const product = products.find(p => p.sku === value || p.itemBarcode === value)
            if (product) {
                handleOpenProductModal(product)
                // clear input manually if needed
                e.currentTarget.value = ''
            } else {
                showError(tCommon('noResults'))
            }
        }
    }

    const updateItemQuantity = (index: number, quantity: number) => {
        const item = fields[index] as any
        const qCount = Math.max(1, quantity)
        // Adjust free quantity. For 'Return' (Only Replacement), it always equals total quantity.
        const freeQty = item.entryType === 'Return' ? qCount : Math.min(item.freeQuantity || 0, qCount)

        update(index, {
            ...item,
            quantity: qCount,
            freeQuantity: freeQty,
            subtotal: (qCount - freeQty) * (item.costPrice || 0)
        })
    }

    const updateItemCost = (index: number, cost: number) => {
        const item = fields[index] as any
        const cVal = Math.max(0.01, cost)
        update(index, {
            ...item,
            costPrice: cVal,
            subtotal: ((item.quantity || 0) - (item.freeQuantity || 0)) * cVal
        })
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Help / How it works section */}
                        <div className="lg:col-span-3 mb-2">
                            <div className={cn(
                                "transition-all duration-300 overflow-hidden border rounded-xl",
                                showHelp ? "bg-blue-50 border-blue-100 shadow-sm" : "bg-white/50 border-gray-100 hover:border-blue-200"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => setShowHelp(!showHelp)}
                                    className="w-full flex items-center justify-between p-3 text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-colors",
                                            showHelp ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Info className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-navy text-sm tracking-tight">{t('howItWorks.title')}</h3>
                                            {!showHelp && <p className="text-xs text-slate-400 font-medium line-clamp-1">{t('howItWorks.description')}</p>}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full">
                                        {showHelp ? tCommon('hide') : tCommon('show')}
                                    </div>
                                </button>

                                {showHelp && (
                                    <div className="px-4 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm text-slate-600 leading-relaxed border-t border-blue-100 pt-4 font-medium">
                                            {t('howItWorks.description')}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="bg-white p-3.5 rounded-xl border border-blue-100/50 shadow-sm space-y-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm">
                                                            {i}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{tCommon('step')} {i}</span>
                                                    </div>
                                                    <p className="text-xs md:text-[13px] text-navy font-bold leading-snug">
                                                        {t(`howItWorks.steps.step${i}`)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Info Card */}
                        <Card className="lg:col-span-2 shadow-sm border-gray-100 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-3 md:p-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-orange/10 p-1.5 md:p-2 rounded-lg">
                                        <Receipt className="w-4 h-4 md:w-5 md:h-5 text-orange" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base md:text-lg font-bold">{t('purchaseDetails')}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Supplier Selection */}
                                    <FormField
                                        control={form.control}
                                        name="supplierId"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="flex items-center gap-1.5">{t('supplier')} <HelpTooltip content={t('help.supplier')} /></FormLabel>
                                                <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                data-testid="purchase-supplier-select"
                                                                className={cn(
                                                                    "w-full justify-between bg-gray-50/50",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value === 'internal'
                                                                    ? t('internalSupplier')
                                                                    : field.value
                                                                        ? suppliers.find((s) => s._id === field.value)?.nameProvider
                                                                        : t('selectSupplier')}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px] p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder={t('searchPlaceholder')} />
                                                            <CommandEmpty>{tCommon('noResults')}</CommandEmpty>
                                                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                                <CommandItem
                                                                    value="internal"
                                                                    onSelect={() => {
                                                                        form.setValue("supplierId", "internal")
                                                                        setSupplierSearchOpen(false)
                                                                    }}
                                                                    className="font-bold text-orange"
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === 'internal' ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {t('internalSupplier')}
                                                                </CommandItem>
                                                                {suppliers.map((supplier) => (
                                                                    <CommandItem
                                                                        value={supplier.nameProvider}
                                                                        key={supplier._id}
                                                                        onSelect={() => {
                                                                            form.setValue("supplierId", supplier._id)
                                                                            setSupplierSearchOpen(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                supplier._id === field.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {supplier.nameProvider}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {fieldState.error && (
                                                    <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {t(`errors.${fieldState.error.message}`)}
                                                    </p>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Reference */}
                                    <FormField
                                        control={form.control}
                                        name="reference"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>{t('reference')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-gray-50/50" readOnly />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {t(`errors.${fieldState.error.message}`)}
                                                    </p>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Purchase Date */}
                                    <FormField
                                        control={form.control}
                                        name="purchaseDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>{t('purchaseDate')}</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal bg-gray-50/50",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>{tCommon('selectDate')}</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Type */}
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('type')}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={watchedItems.length > 0}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-gray-50/50">
                                                            <SelectValue placeholder={t('type')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Normal">{t('purchaseType.normal')}</SelectItem>
                                                        <SelectItem value="WithExchanges">{t('purchaseType.withExchanges')}</SelectItem>
                                                        <SelectItem value="OnlyReplacement">{t('purchaseType.onlyReplacement')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                </div>

                                {/* Product Search */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                        <FormLabel className="text-base font-bold text-navy flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4 text-orange" /> {t('items')}
                                        </FormLabel>
                                        <div className="flex w-full sm:w-[550px] md:w-[700px] gap-2">
                                            <div className="relative flex-1 group">
                                                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange transition-colors" />
                                                <Input
                                                    placeholder={tCommon('scanProduct')}
                                                    className="pl-10 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-orange/30 focus:ring-orange/10 transition-all h-10"
                                                    onKeyDown={handleManualScan}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="sm" className="bg-navy text-white hover:bg-navy-600 hover:text-white border-none shadow-sm h-10 px-4 active:scale-95 transition-all">
                                                            <Plus className="w-4 h-4 mr-2" /> {t('addProduct')}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[400px] p-0" align="end">
                                                        <Command className="rounded-xl overflow-hidden">
                                                            <CommandInput placeholder={t('searchPlaceholder')} className="h-12" />
                                                            <CommandEmpty className="py-6 text-center text-gray-500">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <AlertCircle className="w-8 h-8 text-gray-300" />
                                                                    <span>{tCommon('noResults')}</span>
                                                                </div>
                                                            </CommandEmpty>
                                                            <CommandGroup className="max-h-[300px] overflow-y-auto p-2">
                                                                {localProducts.map((product) => (
                                                                    <CommandItem
                                                                        key={product._id}
                                                                        value={product.name}
                                                                        onSelect={() => handleOpenProductModal(product)}
                                                                        className="rounded-lg p-3 aria-selected:bg-gray-100 cursor-pointer"
                                                                    >
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <div>
                                                                                <div className="font-bold text-navy">{product.name}</div>
                                                                                <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="font-bold text-orange">{formatCurrency(product.costPerUnit || 0)}</div>
                                                                                <div className="text-[10px] text-gray-400">Stock: {product.countInStock}</div>
                                                                            </div>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                            <div className="p-3 bg-gray-50 border-t border-gray-100">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="w-full text-xs font-bold bg-primary hover:bg-primary/80 text-white h-9 transition-all shadow-sm"
                                                                    onClick={() => {
                                                                        setProductSearchOpen(false)
                                                                        setIsProductModalOpen(true)
                                                                    }}
                                                                >
                                                                    <Plus className="w-4 h-4 mr-1" /> {t('createNewProduct')}
                                                                </Button>
                                                            </div>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {/* <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsProductModalOpen(true)}
                                                    className="border-orange/30 text-orange hover:bg-orange/5 hover:text-orange-600 h-9 font-bold transition-all px-4"
                                                >
                                                    <Plus className="w-4 h-4 mr-1.5" /> {t('quickAdd')}
                                                </Button> */}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 overflow-x-auto shadow-sm no-scrollbar">
                                        <Table className="min-w-[800px] lg:w-full table-fixed">
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="w-[300px] text-navy font-bold">{t('productName')}</TableHead>
                                                    <TableHead className="w-[150px] text-navy font-bold">{t('entryType.label')}</TableHead>
                                                    <TableHead className="w-[120px] text-navy font-bold text-center">{t('quantity')}</TableHead>
                                                    <TableHead className="w-[150px] text-navy font-bold text-center">{t('cost')}</TableHead>
                                                    <TableHead className="w-[150px] text-navy font-bold text-center">{t('subtotal')}</TableHead>
                                                    <TableHead className="w-[50px] text-right"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-32 text-center text-gray-400 bg-white italic">
                                                            {t('noItemsAdded')}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    fields.map((field: any, index: number) => (
                                                        <TableRow key={field.id} className="hover:bg-gray-50/50 transition-colors bg-white border-b border-gray-50 last:border-0">
                                                            <TableCell className="py-4 w-[300px]">
                                                                <span className="font-bold text-navy">{field.name}</span>
                                                            </TableCell>
                                                            <TableCell className="w-[150px]">
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[10px] py-0 px-2 h-5 font-medium whitespace-nowrap",
                                                                    field.entryType === 'Exchange' && "bg-orange-50 text-orange-700 border-orange-200",
                                                                    field.entryType === 'Return' && "bg-red-50 text-red-700 border-red-200",
                                                                    field.entryType === 'Replacement' && "bg-navy/5 text-navy opacity-70 border-navy/10"
                                                                )}>
                                                                    {t(`entryType.${field.entryType.toLowerCase()}`)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center w-[120px]">
                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    value={field.quantity}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
                                                                        updateItemQuantity(index, Number(val) || 0)
                                                                    }}
                                                                    className="h-9 border-gray-200 focus:bg-white bg-gray-50/50 text-center font-medium w-24 mx-auto"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center w-[150px]">
                                                                <Input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={field.costPrice}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value.replace(/[^\d.]/g, '')
                                                                        // Allow only one decimal point
                                                                        const parts = val.split('.')
                                                                        val = parts[0] + (parts.length > 1 ? '.' + parts[1] : '')
                                                                        // Strip leading zeros
                                                                        val = val.replace(/^0+(?=\d)/, '')

                                                                        updateItemCost(index, Number(val) > 0 ? Number(val) : 0)
                                                                    }}
                                                                    className="h-9 border-gray-200 focus:bg-white bg-gray-50/50 text-center font-medium w-32 mx-auto"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-navy w-[150px]">
                                                                {formatCurrency(field.subtotal || 0)}
                                                            </TableCell>
                                                            <TableCell className="text-right w-[50px]">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column - Summary & Payment */}
                        <div className="space-y-4 md:space-y-6 lg:sticky lg:top-6 h-fit">
                            <Card className="shadow-sm border-gray-100 overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-3 md:p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-500/10 p-1.5 md:p-2 rounded-lg">
                                            <Truck className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                        </div>
                                        <CardTitle className="text-base md:text-lg font-bold">{t('summary')}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 bg-white">
                                    <div className="space-y-1.5 md:space-y-2 border-b border-dashed border-gray-100 pb-3 md:pb-4">
                                        <div className="flex justify-between text-xs md:text-sm text-gray-500">
                                            <span>{t('subtotal')}</span>
                                            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs md:text-sm text-gray-500">
                                            <span>{t('tax')} (0%)</span>
                                            <span className="font-semibold">{formatCurrency(0)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 md:py-2">
                                        <span className="text-sm md:text-base font-bold text-navy">{t('totalAmount')}</span>
                                        <span className="text-xl md:text-2xl font-black text-orange">{formatCurrency(totalAmount)}</span>
                                    </div>
                                    {watchedItems.length === 0 && (
                                        <div className="mt-2 p-2 md:p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 animate-in fade-in duration-300">
                                            <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 mt-0.5 shrink-0" />
                                            <div className="text-[10px] md:text-xs">
                                                <p className="font-bold">{t('errors.itemsRequired')}</p>
                                                <p className="opacity-80">{t('errors.amountRequired')}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Separator className="bg-gray-100" />

                                    <div className="space-y-3 md:space-y-4 pt-1 md:pt-2">
                                        {/* Payment Status */}
                                        <FormField
                                            control={form.control}
                                            name="paymentStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('paymentStatus')}</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-gray-50/50 border-gray-200">
                                                                <SelectValue placeholder={tCommon('selectStatus')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Unpaid">{t('paymentStatuses.unpaid')}</SelectItem>
                                                            <SelectItem value="Partial">{t('paymentStatuses.partial')}</SelectItem>
                                                            <SelectItem value="Paid">{t('paymentStatuses.paid')}</SelectItem>
                                                            <SelectItem value="Overdue">{t('paymentStatuses.overdue')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Paid Amount & Balance Due */}
                                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 md:gap-3 items-start">
                                            <FormField
                                                control={form.control}
                                                name="paidAmount"
                                                render={({ field }) => (
                                                    <FormItem className="sm:col-span-2">
                                                        <FormLabel className="text-navy font-bold text-xs md:text-sm">{t('paidAmount')}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm md:text-base">$</span>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    {...field}
                                                                    placeholder="0.00"
                                                                    className="bg-gray-50/50 border-gray-200 text-right font-id-bold text-base md:text-lg h-10 md:h-12 pl-6 md:pl-7 focus:bg-white transition-colors"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-2 sm:col-span-3">
                                                <div className="hidden sm:block h-[1rem] md:h-[1.125rem]" /> {/* Spacer for label alignment */}
                                                <div className="p-2 md:p-3 bg-blue-50/50 rounded-lg border border-blue-100 h-10 md:h-12 flex items-center justify-between gap-2 md:gap-4 px-3 md:px-4 shadow-sm">
                                                    <span className="text-[9px] md:text-[10px] font-black text-blue-700 uppercase tracking-wider md:tracking-widest whitespace-nowrap">{t('balanceDue')}</span>
                                                    <span className="font-black text-blue-800 text-lg md:text-xl truncate">{formatCurrency(Math.max(0, totalAmount - (form.watch('paidAmount') || 0)))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-gray-100 overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-2 md:py-3 px-3 md:px-4 flex items-center justify-between space-y-0">
                                    <CardTitle className="text-xs md:text-sm font-bold text-gray-500">{t('notes')}</CardTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsNotesCollapsed(!isNotesCollapsed)}
                                        className="h-7 md:h-8 px-2 md:px-3 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-orange hover:bg-orange/10 rounded-lg transition-all"
                                    >
                                        {isNotesCollapsed ? t('addNote') : t('omitNote')}
                                    </Button>
                                </CardHeader>
                                {!isNotesCollapsed && (
                                    <CardContent className="p-3 md:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder={t('notesPlaceholder')}
                                                            className="bg-gray-50/50 border-gray-100 focus:bg-white min-h-[100px] text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                )}
                            </Card>

                            <Card className="shadow-sm border-gray-100 overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-2 md:py-3 px-3 md:px-4 flex items-center justify-between space-y-0">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xs md:text-sm font-bold text-gray-500">{t('voucher')}</CardTitle>
                                        <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-100">{tCommon('optional')}</Badge>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsVoucherCollapsed(!isVoucherCollapsed)}
                                        className="h-7 md:h-8 px-2 md:px-3 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-orange hover:bg-orange/10 rounded-lg transition-all"
                                    >
                                        {isVoucherCollapsed ? t('addVoucher') || 'Agregar' : t('omitVoucher') || 'Omitir'}
                                    </Button>
                                </CardHeader>
                                {!isVoucherCollapsed && (
                                    <CardContent className="p-3 md:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="attachments"
                                            render={({ field }) => (
                                                <div className="space-y-3">
                                                    {field.value && field.value.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {field.value.map((file: any, index: number) => (
                                                                <div key={index} className="relative group rounded-xl border border-gray-100 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
                                                                    {file.type?.startsWith('image/') ? (
                                                                        <Image
                                                                            src={file.url}
                                                                            alt={file.name}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                                                            <FileText className="w-8 h-8" />
                                                                            <span className="text-[10px] font-medium truncate max-w-[200px]">{file.name}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="icon"
                                                                            className="h-8 w-8 rounded-full shadow-lg"
                                                                            onClick={() => {
                                                                                const newVal = field.value?.filter((_: any, i: number) => i !== index)
                                                                                field.onChange(newVal)
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-3 px-3 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                                                            <div className="mb-2 p-2 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 group-hover:text-orange transition-colors">
                                                                <UploadCloud className="w-5 h-5" />
                                                            </div>
                                                            <div className="text-center space-y-0.5">
                                                                <p className="text-[10px] font-bold text-navy">{tCommon('uploadFile')}</p>
                                                                <p className="text-[9px] text-gray-400">{tCommon('maxFileSize')} 4MB</p>
                                                            </div>
                                                            <div className="mt-4">
                                                                <UploadButton
                                                                    endpoint="imageUploader"
                                                                    onClientUploadComplete={(res) => {
                                                                        const current = field.value || []
                                                                        const newlyAdded = res.map(file => ({
                                                                            name: file.name,
                                                                            url: file.ufsUrl || file.url,
                                                                            type: 'image/jpeg'
                                                                        }))
                                                                        field.onChange([...current, ...newlyAdded])
                                                                        showSuccess(tCommon('uploadSuccess'))
                                                                    }}
                                                                    onUploadError={(error: Error) => {
                                                                        showError(`${tCommon('uploadError')}: ${error.message}`)
                                                                    }}
                                                                    appearance={{
                                                                        button: "bg-navy text-white text-[10px] font-black uppercase tracking-wider h-8 px-4 rounded-lg shadow-sm active:scale-95 transition-all border-none ut-uploading:bg-gray-400 ut-readying:bg-navy/80",
                                                                        allowedContent: "hidden"
                                                                    }}
                                                                    content={{
                                                                        button({ ready, isUploading }) {
                                                                            if (isUploading) return tCommon('loading')
                                                                            if (ready) return t('selectVoucher') || 'Select'
                                                                            return tCommon('loading')
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </CardContent>
                                )}
                            </Card>


                            <div className="flex gap-2 md:gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="flex-1 h-10 md:h-12 rounded-xl border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-sm md:text-base"
                                    onClick={() => router.back()}
                                >
                                    {tCommon('cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    data-testid="purchase-submit-button"
                                    className="flex-[2] bg-navy text-white hover:bg-navy-600 h-10 md:h-12 rounded-xl shadow-lg shadow-navy/20 active:scale-95 transition-all text-sm md:text-base font-bold"
                                    disabled={isPending}
                                >
                                    {isPending ? tCommon('loading') : (initialData ? t('updatePurchase') : t('createPurchase'))}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form >

            {/* Product Add Modal */}
            < Dialog open={modalOpen} onOpenChange={setModalOpen} >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('addProduct')}</DialogTitle>
                        <DialogDescription>
                            {selectedProduct?.name} - SKU: {selectedProduct?.sku}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                            {/* Image placeholder */}
                            {selectedProduct?.images && selectedProduct.images.length > 0 && selectedProduct.images[0].imgUrl ? (
                                <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-100 bg-white shrink-0">
                                    <Image
                                        src={selectedProduct.images[0].imgUrl}
                                        alt={selectedProduct.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-dashed border-gray-200">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">No Img</span>
                                </div>
                            )}
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Stock: {selectedProduct?.countInStock}</p>
                                <p className="text-sm font-medium text-gray-500">Current Cost: {formatCurrency(selectedProduct?.costPerUnit || 0)}</p>
                                <p className="text-sm font-medium text-gray-500">Price: {formatCurrency(selectedProduct?.listPrice || 0)}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('quantity')}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={modalQuantity}
                                    data-testid="purchase-modal-quantity-input"
                                    onChange={(e) => setModalQuantity(Math.max(1, Number(e.target.value)))}
                                    className="text-center font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('cost')}</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={modalCost}
                                    data-testid="purchase-modal-cost-input"
                                    onChange={(e) => setModalCost(Math.max(0.01, Number(e.target.value)))}
                                    className="text-center font-bold"
                                />
                            </div>
                        </div>

                        {modalEntryType === 'Exchange' && (
                            <div className={cn("space-y-2 p-3 bg-orange/5 rounded-lg border border-orange/10", showFreeQtyError && "border-red-500 bg-red-50")}>
                                <Label className={cn("text-orange-700", showFreeQtyError && "text-red-600")}>{t('freeQuantity') || 'Free/Warranty Quantity'}</Label>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            max={modalQuantity}
                                            value={modalFreeQuantity}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/^0+(?=\d)/, '')
                                                const numericVal = Number(val)
                                                // Prevent setting value > modalQuantity
                                                if (numericVal > modalQuantity) return

                                                setModalFreeQuantity(numericVal)
                                                if (numericVal > 0) setShowFreeQtyError(false)
                                            }}
                                            className={cn("text-center font-bold border-orange/20 focus:border-orange bg-white w-24", showFreeQtyError && "border-red-500 focus:border-red-500")}
                                        />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {t('freeCountHint', { count: modalQuantity })}
                                        </span>
                                    </div>
                                    {showFreeQtyError && (
                                        <p className="text-[11px] font-bold text-red-500 animate-in slide-in-from-top-1 px-1">
                                            {t('errors.freeQuantityRequired')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4">
                                <Label className="text-base font-medium">{t('entryType.label') || 'Entry Type'}</Label>
                                <RadioGroup value={modalEntryType} onValueChange={setModalEntryType} className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="Replacement" id="r1" />
                                        <Label htmlFor="r1" className="text-sm font-medium cursor-pointer">{t('entryType.replacement')}</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="Exchange" id="r2" />
                                        <Label htmlFor="r2" className="text-sm font-medium cursor-pointer">{t('entryType.exchange')}</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="Return" id="r3" />
                                        <Label htmlFor="r3" className="text-sm font-medium cursor-pointer">{t('entryType.return')}</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-4">
                                {modalEntryType !== 'Replacement' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <Label className="text-sm font-medium">{t('reasons.label') || 'Reason'}</Label>
                                        <Select onValueChange={setModalReason} defaultValue={modalReason}>
                                            <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-xl focus:ring-0">
                                                <SelectValue placeholder="Select reason" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Expired">{t('reasons.expired')}</SelectItem>
                                                <SelectItem value="Damaged">{t('reasons.damaged')}</SelectItem>
                                                <SelectItem value="Other">{t('reasons.other')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>{tCommon('cancel')}</Button>
                        <Button data-testid="purchase-modal-add-button" onClick={handleConfirmAddProduct}>{tCommon('add')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
            <ProductModal
                open={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                storeId={storeId}
                onSuccess={(newProduct) => {
                    setLocalProducts(prev => [newProduct, ...prev])

                    // Directly add the product to the list with values from the form
                    const qty = Math.max(1, newProduct.countInStock || 1)
                    const cost = Math.max(0.01, newProduct.costPerUnit || 1)

                    append({
                        productId: newProduct._id,
                        name: newProduct.name,
                        quantity: qty,
                        freeQuantity: 0,
                        costPrice: cost,
                        subtotal: qty * cost,
                        entryType: 'Replacement', // "Compra Normal"
                    })
                }}
            />
        </>
    )
}

export default PurchaseForm
