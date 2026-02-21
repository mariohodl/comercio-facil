'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
    ArrowLeft,
    Printer,
    Edit,
    Calendar as CalendarIcon,
    User,
    Receipt,
    Truck,
    Package,
    ShoppingCart,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Download
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

interface PurchaseDetailsProps {
    purchase: any
    storeId: string
}

const PurchaseDetails = ({ purchase, storeId }: PurchaseDetailsProps) => {
    const t = useTranslations('purchases')
    const tCommon = useTranslations('common')
    const router = useRouter()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Received':
                return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> {t('statuses.received')}</Badge>
            case 'Pending':
                return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> {t('statuses.pending')}</Badge>
            case 'Ordered':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Truck className="w-3 h-3 mr-1" /> {t('statuses.ordered')}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid':
                return <Badge className="bg-green-500 text-white border-none">{t('paymentStatuses.paid')}</Badge>
            case 'Unpaid':
                return <Badge className="bg-red-500 text-white border-none">{t('paymentStatuses.unpaid')}</Badge>
            case 'Partial':
                return <Badge className="bg-orange text-white border-none">{t('paymentStatuses.partial')}</Badge>
            case 'Overdue':
                return <Badge className="bg-purple-600 text-white border-none">{t('paymentStatuses.overdue')}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 print:p-0">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-gray-100 active:scale-95 transition-all">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {tCommon('back')}
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint} className="active:scale-95 transition-all">
                        <Printer className="w-4 h-4 mr-2" /> {tCommon('print')}
                    </Button>
                    <Button onClick={() => router.push(`/admin/${storeId}/purchases/${purchase._id}/edit`)} className="bg-navy text-white hover:bg-navy-600 active:scale-95 transition-all">
                        <Edit className="w-4 h-4 mr-2" /> {tCommon('edit')}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                {/* Banner Section */}
                <div className="bg-gray-50 border-b border-gray-100 p-8 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-navy rounded-xl p-3 shadow-lg shadow-navy/20">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-navy uppercase tracking-tight">{t('title')}</h1>
                                <p className="text-gray-500 font-mono text-sm">{purchase.reference}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">

                            {getPaymentStatusBadge(purchase.paymentStatus)}
                            <Badge variant="outline" className="border-navy/20 text-navy bg-navy/5">
                                {t(`purchaseType.${purchase.type.charAt(0).toLowerCase() + purchase.type.slice(1)}`) || purchase.type}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-right">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t('date')}</p>
                            <p className="font-bold text-navy">{format(new Date(purchase.purchaseDate), 'PPP')}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t('store')}</p>
                            <p className="font-bold text-navy">Main Store</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* Supplier Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-orange font-bold uppercase text-xs tracking-widest">
                                {purchase.supplierId ? (
                                    <><Truck className="w-4 h-4" /> {t('supplierInformation')}</>
                                ) : (
                                    <><User className="w-4 h-4" /> {t('internalSupplier')}</>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <User className="w-16 h-16 text-navy" />
                                </div>
                                <h3 className="text-xl font-bold text-navy mb-2">{purchase.supplierId?.nameProvider || t('internalSupplier')}</h3>
                                {purchase.supplierId && (
                                    <div className="space-y-1 text-sm text-gray-500">
                                        <p>RFC: {purchase.supplierId?.rfc || '-'}</p>
                                        <p>Clave: {purchase.supplierId?.clave || '-'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600 font-bold uppercase text-xs tracking-widest">
                                <Receipt className="w-4 h-4" /> {t('financialSummary')}
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{t('totalItems')}</span>
                                    <span className="font-bold text-navy">{purchase.items.length} {t('items').toLowerCase()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{t('paidAmount')}</span>
                                    <span className="font-bold text-green-600">{formatCurrency(purchase.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-100 pt-3">
                                    <span className="text-gray-400">{t('balanceDue')}</span>
                                    <span className={cn("text-lg font-black", purchase.totalAmount - purchase.paidAmount > 0 ? "text-red-500" : "text-green-600")}>
                                        {formatCurrency(Math.max(0, purchase.totalAmount - purchase.paidAmount))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-navy font-bold uppercase text-xs tracking-widest">
                            <Package className="w-4 h-4" /> {t('itemizedList')}
                        </div>
                        <div className="rounded-2xl border border-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                                        <TableHead className="py-5 font-bold text-navy">{t('productName')}</TableHead>
                                        <TableHead className="py-5 font-bold text-center text-navy">{t('quantity')}</TableHead>
                                        <TableHead className="py-5 font-bold text-center text-navy">{t('type')}</TableHead>
                                        <TableHead className="py-5 font-bold text-right text-navy">{t('costPrice')}</TableHead>
                                        <TableHead className="py-5 font-bold text-right text-navy">{t('subtotal')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchase.items.map((item: any, index: number) => (
                                        <TableRow key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                                            <TableCell className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-navy">{item.name}</span>
                                                    {item.reason && (
                                                        <span className="text-xs text-red-500 font-medium bg-red-50 w-fit px-1 rounded">
                                                            {t('reasons.label')}: {t(`reasons.${item.reason.toLowerCase()}`) || item.reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 text-center font-id-bold">
                                                <Badge variant="outline" className="font-mono">{item.quantity}</Badge>
                                            </TableCell>
                                            <TableCell className="py-5 text-center">
                                                <Badge variant="secondary" className="text-[10px] scale-90 opacity-70">
                                                    {item.entryType ? (t(`entryType.${item.entryType.toLowerCase()}`) || item.entryType) : t('purchaseType.normal')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-5 text-right font-medium text-gray-500">
                                                {formatCurrency(item.costPrice)}
                                            </TableCell>
                                            <TableCell className="py-5 text-right font-black text-navy">
                                                {formatCurrency(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Total Section */}
                    <div className="flex flex-col md:flex-row justify-between gap-10 pt-6">
                        <div className="md:w-1/2 space-y-4">
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t('importantNotes')}</div>
                            {purchase.notes ? (
                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 text-sm text-blue-900 leading-relaxed italic">
                                    "{purchase.notes}"
                                </div>
                            ) : (
                                <div className="text-gray-300 text-sm italic">{t('noNotes')}</div>
                            )}

                            <Separator className="my-4 bg-gray-100" />

                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">{t('attachments')}</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-gray-50 border-gray-100 text-gray-600">
                                    <FileText className="w-3 h-3 mr-2" /> Invoice.pdf
                                </Button>
                            </div>
                        </div>

                        <div className="md:w-1/3 bg-gray-900 rounded-3xl p-8 text-white shadow-2xl shadow-navy/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm uppercase font-bold tracking-widest">{t('subtotal')}</span>
                                    <span className="font-bold">{formatCurrency(purchase.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                    <span className="text-gray-400 text-sm uppercase font-bold tracking-widest">{t('tax')} (0%)</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-orange uppercase font-black tracking-widest mb-1">{t('totalAmount')}</span>
                                        <span className="text-3xl font-black">{formatCurrency(purchase.totalAmount)}</span>
                                    </div>
                                    <div className="bg-white/10 p-2 rounded-lg">
                                        <Receipt className="w-6 h-6 text-orange" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default PurchaseDetails
