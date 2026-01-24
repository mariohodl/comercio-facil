'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, Minus, Printer, RotateCcw, Settings, Search } from 'lucide-react'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from 'next-intl'
import BarcodeModal from './barcode-modal'

interface SelectedProduct {
    product: IProduct
    quantity: number
}

import { useParams } from 'next/navigation'

export default function PrintBarcodesPage() {
    const t = useTranslations()
    const { store } = useParams<{ store: string }>()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<IProduct[]>([])
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
    const [paperSize, setPaperSize] = useState('a4')
    const [storeName, setStoreName] = useState('Mi Tienda')
    const [showStoreName, setShowStoreName] = useState(true)
    const [showProductName, setShowProductName] = useState(true)
    const [showPrice, setShowPrice] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    const debouncedSearch = useDebounce(searchQuery, 300)

    useEffect(() => {
        const searchProducts = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const result = await getAllProductsForAdmin({
                    query: debouncedSearch,
                    limit: 5,
                    page: 1,
                    store
                })
                setSearchResults(result.products)
            } catch (error) {
                console.error('Error searching products:', error)
            } finally {
                setIsSearching(false)
            }
        }

        searchProducts()
    }, [debouncedSearch])

    const handleAddProduct = (product: IProduct) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p.product._id === product._id)
            if (existing) {
                return prev.map(p =>
                    p.product._id === product._id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                )
            }
            return [...prev, { product, quantity: 1 }]
        })
        setSearchQuery('')
        setSearchResults([])
    }

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.product._id !== productId))
    }

    const handleQuantityChange = (productId: string, delta: number) => {
        setSelectedProducts(prev => prev.map(p => {
            if (p.product._id === productId) {
                const newQuantity = Math.max(1, p.quantity + delta)
                return { ...p, quantity: newQuantity }
            }
            return p
        }))
    }

    const handleReset = () => {
        setSelectedProducts([])
        setSearchQuery('')
        setSearchResults([])
    }

    return (
        <div className="space-y-6 md:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 md:px-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-navy">{t('printBarcode.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('printBarcode.subtitle')}</p>
                </div>
            </div>

            <Card className="mx-2 md:mx-0">
                <CardContent className="p-4 md:p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-navy">{t('printBarcode.warehouse')} <span className="text-red-500">*</span></Label>
                            <Select>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder={t('printBarcode.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">{t('printBarcode.mainWarehouse')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-navy">{t('printBarcode.store')} <span className="text-red-500">*</span></Label>
                            <Select>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder={t('printBarcode.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">{t('printBarcode.mainStore')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <Label className="text-sm font-semibold text-navy">{t('printBarcode.product')} <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('printBarcode.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 w-full"
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute z-20 w-full bg-white border rounded-md shadow-xl mt-1 max-h-60 overflow-auto border-gray-100">
                                {searchResults.map(product => (
                                    <div
                                        key={product._id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0 transition-colors"
                                        onClick={() => handleAddProduct(product)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-8 w-8 rounded bg-gray-50 border overflow-hidden">
                                                <Image
                                                    src={product.images[0]?.imgUrl || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="font-medium text-navy text-sm">{product.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{product.sku}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedProducts.length > 0 && (
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="min-w-[200px]">{t('printBarcode.product')}</TableHead>
                                            <TableHead className="min-w-[120px]">{t('printBarcode.sku')}</TableHead>
                                            <TableHead className="min-w-[120px]">{t('printBarcode.code')}</TableHead>
                                            <TableHead className="min-w-[140px]">{t('printBarcode.qty')}</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedProducts.map(({ product, quantity }) => (
                                            <TableRow key={product._id} className="hover:bg-gray-50/30 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-gray-50 flex-shrink-0">
                                                            <Image
                                                                src={product.images[0]?.imgUrl || '/placeholder.png'}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-navy font-semibold text-sm line-clamp-1">{product.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 italic">
                                                        {product.sku}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{product.itemBarcode}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-orange-50 hover:text-orange"
                                                            onClick={() => handleQuantityChange(product._id, -1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center font-bold text-navy">{quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-orange-50 hover:text-orange"
                                                            onClick={() => handleQuantityChange(product._id, 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleRemoveProduct(product._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="mx-2 md:mx-0">
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-navy">{t('printBarcode.paperSize')} <span className="text-red-500">*</span></Label>
                            <Select value={paperSize} onValueChange={setPaperSize}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder={t('printBarcode.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="a4">A4 (210mm x 297mm)</SelectItem>
                                    <SelectItem value="a3">A3 (297mm x 420mm)</SelectItem>
                                    <SelectItem value="a5">A5 (148mm x 210mm)</SelectItem>
                                    <SelectItem value="letter">Letter (216mm x 279mm)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/30">
                                <Label htmlFor="store-name" className="text-sm font-medium text-navy cursor-pointer">
                                    {t('printBarcode.showStoreName')}
                                </Label>
                                <Switch
                                    id="store-name"
                                    checked={showStoreName}
                                    onCheckedChange={setShowStoreName}
                                    className="data-[state=checked]:bg-orange"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/30">
                                <Label htmlFor="product-name" className="text-sm font-medium text-navy cursor-pointer">
                                    {t('printBarcode.showProductName')}
                                </Label>
                                <Switch
                                    id="product-name"
                                    checked={showProductName}
                                    onCheckedChange={setShowProductName}
                                    className="data-[state=checked]:bg-orange"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/30">
                                <Label htmlFor="price" className="text-sm font-medium text-navy cursor-pointer">
                                    {t('printBarcode.showPrice')}
                                </Label>
                                <Switch
                                    id="price"
                                    checked={showPrice}
                                    onCheckedChange={setShowPrice}
                                    className="data-[state=checked]:bg-orange"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="bg-orange/10 text-orange hover:bg-orange hover:text-white border-orange/20 h-11 px-6 font-bold"
                                onClick={() => setIsModalOpen(true)}
                                disabled={selectedProducts.length === 0}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                {t('printBarcode.generateBarcode')}
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-navy/5 text-navy hover:bg-navy hover:text-white border-navy/10 h-11 px-6 font-bold"
                                onClick={handleReset}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t('printBarcode.resetBarcode')}
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 h-11 px-8 font-extrabold"
                                onClick={() => setIsModalOpen(true)}
                                disabled={selectedProducts.length === 0}
                            >
                                <Printer className="mr-2 h-5 w-5" />
                                {t('printBarcode.printBarcode')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <BarcodeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={selectedProducts}
                config={{
                    paperSize,
                    storeName,
                    showStoreName,
                    showProductName,
                    showPrice
                }}
            />
        </div>
    )
}
