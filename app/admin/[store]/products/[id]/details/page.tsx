import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/actions/product.actions'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Edit } from 'lucide-react'
import Barcode from '@/components/shared/barcode'

export default async function ProductDetailsPage(props: {
    params: Promise<{ id: string; store: string }>
}) {
    const params = await props.params
    const { id, store } = params
    const product = await getProductById(id)

    if (!product) notFound()

    return (
        <main className='max-w-6xl mx-auto p-4 space-y-6'>
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className='flex items-center gap-2'>
                    <Link href={`/admin/${store}/products`} className="text-muted-foreground hover:text-orange transition-colors flex items-center gap-1 text-sm">
                        <ChevronLeft className="h-4 w-4" /> Back to Products
                    </Link>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-navy">{product.name}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${product.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {product.isPublished ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">Product ID: {product._id}</p>
                    </div>
                    <Link href={`/admin/${store}/products/${product._id}`}>
                        <Button className="bg-orange hover:bg-orange-dark text-white w-full md:w-auto shadow-sm">
                            <Edit className="h-4 w-4 mr-2" /> Edit Product
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
                                <Image
                                    src={product.images && product.images.length > 0 ? product.images[0].imgUrl : '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-2">
                            <h3 className="font-semibold text-navy">Description</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {product.description || "No description available."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange rounded-full"></span>
                                General Information
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                                    <p className="font-medium text-navy mt-1">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Sub Category</p>
                                    <p className="font-medium text-navy mt-1">{product.subCategory || 'None'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Brand</p>
                                    <p className="font-medium text-navy mt-1">{product.brand || 'None'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Product Type</p>
                                    <p className="font-medium text-navy mt-1">{product.productType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Unit</p>
                                    <p className="font-medium text-navy mt-1">{product.unit}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Store ID</p>
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
                                Pricing & Costs
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">List Price</p>
                                    <p className="font-medium text-navy mt-1 line-through text-gray-400">{formatCurrency(product.listPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Selling Price</p>
                                    <p className="font-bold text-xl text-green-600 mt-1">{formatCurrency(product.price)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Per Unit</p>
                                    <p className="font-medium text-navy mt-1">{formatCurrency(product.costPerUnit || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tax ({product.taxType})</p>
                                    <p className="font-medium text-navy mt-1">{product.tax}%</p>
                                </div>
                                <div className="col-span-2 md:col-span-4 bg-gray-50 p-3 rounded-md flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Discount Type</p>
                                        <p className="font-medium text-navy">{product.discountType || 'None'}</p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Discount Value</p>
                                        <p className="font-medium text-navy">{product.discountValue || 0}</p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Discount Price</p>
                                        <p className="font-medium text-navy">{product.discountPrice ? formatCurrency(product.discountPrice) : 'N/A'}</p>
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
                                Inventory & Codes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">SKU</p>
                                            <p className="font-mono font-medium text-navy mt-1 bg-gray-100 px-2 py-1 rounded inline-block whitespace-nowrap">{product.sku}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Warehouse</p>
                                            <p className="font-medium text-navy mt-1">{product.warehouse}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">In Stock</p>
                                            <p className="font-medium text-navy mt-1">{product.countInStock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Min Alert</p>
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
                                        <p className="text-muted-foreground text-sm">No barcode generated</p>
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
                                    Product Variants
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-md">Variant</th>
                                                <th className="px-4 py-3">SKU</th>
                                                <th className="px-4 py-3">Barcode</th>
                                                <th className="px-4 py-3">Price</th>
                                                <th className="px-4 py-3 rounded-r-md">Stock</th>
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
                                                        {formatCurrency(variant.price)}
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
