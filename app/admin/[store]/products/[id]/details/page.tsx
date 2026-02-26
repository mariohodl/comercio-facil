import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/actions/product.actions'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Edit } from 'lucide-react'
import Barcode from '@/components/shared/barcode'
import { getTranslations } from 'next-intl/server'

export default async function ProductDetailsPage(props: {
    params: Promise<{ id: string; store: string }>
}) {
    const params = await props.params
    const { id, store } = params
    const product = await getProductById(id)

    if (!product) notFound()

    const t = await getTranslations('products')
    const tCommon = await getTranslations('common')

    return (
        <main className='max-w-6xl mx-auto p-4 space-y-6'>
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className='flex items-center gap-2'>
                    <Link href={`/admin/${store}/products`} className="text-muted-foreground hover:text-orange transition-colors flex items-center gap-1 text-sm">
                        <ChevronLeft className="h-4 w-4" /> {t('backToProduct')}
                    </Link>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-navy">{product.name}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${product.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {product.isPublished ? tCommon('active') : tCommon('inactive')}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{t('details.productId')}: {product._id}</p>
                    </div>
                    <Link href={`/admin/${store}/products/${product._id}`}>
                        <Button className="bg-orange hover:bg-orange-dark text-white w-full md:w-auto shadow-sm">
                            <Edit className="h-4 w-4 mr-2" /> {t('editProduct')}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Image & Description */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                                {product.images && product.images.length > 0 && product.images[0].imgUrl ? (
                                    <Image
                                        src={product.images[0].imgUrl}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                        <span className="text-4xl">📷</span>
                                        <span className="text-xs font-medium uppercase tracking-widest">{tCommon('noImg')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-2">
                            <h3 className="font-semibold text-navy">{t('description')}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {product.description || t('details.noDescription')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange rounded-full"></span>
                                {t('details.generalInformation')}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('category')}</p>
                                    <p className="font-medium text-navy mt-1">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('subCategory')}</p>
                                    <p className="font-medium text-navy mt-1">{product.subCategory || tCommon('notAvailable')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('brand')}</p>
                                    <p className="font-medium text-navy mt-1">{product.brand || tCommon('notAvailable')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('productType')}</p>
                                    <p className="font-medium text-navy mt-1">{product.productType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('unit')}</p>
                                    <p className="font-medium text-navy mt-1">{product.unit}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('store')}</p>
                                    <p className="font-medium text-navy mt-1">{product.store}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing & Costs */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                {t('details.pricingAndCosts')}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('listPrice')}</p>
                                    <p className="font-medium text-navy mt-1 line-through text-gray-400">{formatCurrency(product.listPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('sellingPrice')}</p>
                                    <p className="font-bold text-xl text-green-600 mt-1">{formatCurrency(product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.listPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('costPerUnit')}</p>
                                    <p className="font-medium text-navy mt-1">{formatCurrency(product.costPerUnit || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('tax')} ({product.taxType})</p>
                                    <p className="font-medium text-navy mt-1">{product.tax}%</p>
                                </div>
                                <div className="col-span-2 md:col-span-4 bg-gray-50 p-3 rounded-md flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">{t('discountType')}</p>
                                        <p className="font-medium text-navy">{product.discountType || tCommon('notAvailable')}</p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">{t('discountValue')}</p>
                                        <p className="font-medium text-navy">{product.discountValue || 0}</p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">{t('discountPrice')}</p>
                                        <p className="font-medium text-navy">{product.discountPrice && product.discountPrice > 0 ? formatCurrency(product.discountPrice) : formatCurrency(product.listPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory & Barcode */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                {t('details.inventoryAndCodes')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('sku')}</p>
                                            <p className="font-mono font-medium text-navy mt-1 bg-gray-100 px-2 py-1 rounded inline-block whitespace-nowrap">{product.sku}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('warehouse')}</p>
                                            <p className="font-medium text-navy mt-1">{product.warehouse}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('inStock')}</p>
                                            <p className="font-medium text-navy mt-1">{product.countInStock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('minAlert')}</p>
                                            <p className="font-medium text-red-600 mt-1">{product.quantityAlert}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-lg p-4">
                                    {product.itemBarcode ? (
                                        <>
                                            <Barcode value={product.itemBarcode} format={product.barcodeSymbology === 'EAN-13' ? 'EAN13' : product.barcodeSymbology === 'Code 39' ? 'CODE39' : 'CODE128'} />
                                            <p className="text-xs text-muted-foreground mt-2">{product.barcodeSymbology}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">{t('details.noBarcode')}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Variants Section */}
                    {product.variants && product.variants.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                    {t('details.productVariants')}
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-md">{t('variant')}</th>
                                                <th className="px-4 py-3">{t('sku')}</th>
                                                <th className="px-4 py-3">{t('barcode')}</th>
                                                <th className="px-4 py-3">{t('price')}</th>
                                                <th className="px-4 py-3 rounded-r-md">{t('stock')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from(new Map(product.variants.map((v: any) => [v.sku, v])).values()).map((variant: any, index: number) => (
                                                <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-navy">
                                                        {variant.attributes.map((a: any) => `${a.name}: ${a.value}`).join(', ')}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs bg-gray-50 rounded px-2 py-1 inline-block mt-1">
                                                        {variant.sku}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                        {variant.barcode || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {formatCurrency(variant.listPrice)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${variant.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {variant.countInStock}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    )
}
