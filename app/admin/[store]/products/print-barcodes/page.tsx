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
import { Trash2, Plus, Minus, Printer, RotateCcw, Settings } from 'lucide-react'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from 'next-intl'
import BarcodeModal from './barcode-modal'

interface SelectedProduct {
    product: IProduct
    quantity: number
}

export default function PrintBarcodesPage() {
    const t = useTranslations()
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
                    page: 1
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('printBarcode.title')}</h1>
                <p className="text-muted-foreground">{t('printBarcode.subtitle')}</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>{t('printBarcode.warehouse')} <span className="text-red-500">*</span></Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('printBarcode.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">{t('printBarcode.mainWarehouse')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('printBarcode.store')} <span className="text-red-500">*</span></Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('printBarcode.select')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">{t('printBarcode.mainStore')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <Label>{t('printBarcode.product')} <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder={t('printBarcode.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                {searchResults.map(product => (
                                    <div
                                        key={product._id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                        onClick={() => handleAddProduct(product)}
                                    >
                                        <span>{product.name}</span>
                                        <span className="text-sm text-gray-500">{product.sku}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedProducts.length > 0 && (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>{t('printBarcode.product')}</TableHead>
                                        <TableHead>{t('printBarcode.sku')}</TableHead>
                                        <TableHead>{t('printBarcode.code')}</TableHead>
                                        <TableHead>{t('printBarcode.qty')}</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedProducts.map(({ product, quantity }) => (
                                        <TableRow key={product._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                                                        <Image
                                                            src={product.images[0]?.imgUrl || '/placeholder.png'}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span>{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell>{product.itemBarcode}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleQuantityChange(product._id, -1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center">{quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleQuantityChange(product._id, 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>{t('printBarcode.paperSize')} <span className="text-red-500">*</span></Label>
                            <Select value={paperSize} onValueChange={setPaperSize}>
                                <SelectTrigger>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="store-name">{t('printBarcode.showStoreName')}</Label>
                                <Switch
                                    id="store-name"
                                    checked={showStoreName}
                                    onCheckedChange={setShowStoreName}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="product-name">{t('printBarcode.showProductName')}</Label>
                                <Switch
                                    id="product-name"
                                    checked={showProductName}
                                    onCheckedChange={setShowProductName}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="price">{t('printBarcode.showPrice')}</Label>
                                <Switch
                                    id="price"
                                    checked={showPrice}
                                    onCheckedChange={setShowPrice}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="bg-orange-400 text-white hover:bg-orange-500 hover:text-white border-none"
                                onClick={() => setIsModalOpen(true)}
                                disabled={selectedProducts.length === 0}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                {t('printBarcode.generateBarcode')}
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-navy text-white hover:bg-navy-dark hover:text-white border-none"
                                onClick={handleReset}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t('printBarcode.resetBarcode')}
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => setIsModalOpen(true)}
                                disabled={selectedProducts.length === 0}
                            >
                                <Printer className="mr-2 h-4 w-4" />
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
