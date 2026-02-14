'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    FileText,
    RefreshCw,
    Search,
    Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    getLowStockProductsForAdmin,
    getAllCategories,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { useState, useEffect, useTransition, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserWarehouses } from '@/lib/actions/warehouse.actions'
import { getUserStores } from '@/lib/actions/store.actions'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import EditLowStockModal from '@/components/admin/stock/edit-low-stock-modal'

type LowStockListDataProps = {
    products: IProduct[]
    totalPages: number
    totalProducts: number
    to: number
    from: number
}

const LowStockList = ({ store }: { store: string }) => {
    const t = useTranslations('stock')
    const tCommon = useTranslations('common')
    const [page, setPage] = useState<number>(1)
    const [inputValue, setInputValue] = useState<string>('')
    const [category, setCategory] = useState<string>('all')
    const [warehouse, setWarehouse] = useState<string>('all')
    const [storeFilter, setStoreFilter] = useState<string>('all')
    const [stockType, setStockType] = useState<'low' | 'out' | 'all'>('all')
    const [data, setData] = useState<LowStockListDataProps>()
    const [categories, setCategories] = useState<string[]>([])
    const [warehouses, setWarehouses] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

    const fetchData = useCallback((pageToFetch: number) => {
        startTransition(() => {
            getLowStockProductsForAdmin({
                query: inputValue,
                page: pageToFetch,
                category,
                store: storeFilter === 'all' ? store : storeFilter,
                type: stockType,
            }).then((result) => {
                setData(result)
            })
        })
    }, [inputValue, category, storeFilter, stockType, store])

    useEffect(() => {
        const init = async () => {
            const [cats, whses, strs] = await Promise.all([
                getAllCategories(),
                getUserWarehouses(),
                getUserStores(),
            ])
            setCategories(cats)
            setWarehouses(whses)
            setStores(strs)
            fetchData(1)
        }
        init()
    }, [fetchData])

    useEffect(() => {
        fetchData(1)
        setPage(1)
    }, [fetchData])

    const handlePageChange = (changeType: 'next' | 'prev') => {
        const newPage = changeType === 'next' ? page + 1 : page - 1
        setPage(newPage)
        fetchData(newPage)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
    }

    const handleEdit = (product: IProduct) => {
        setSelectedProduct(product)
        setEditModalOpen(true)
    }

    return (
        <div className='space-y-4'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h1 className='font-bold text-2xl'>{t('lowStocks')}</h1>
                    <p className='text-muted-foreground text-sm'>{t('manageLowStock')}</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                    <Button variant='outline' size='icon'>
                        <FileText className='w-4 h-4 text-red-500' />
                    </Button>
                    <Button variant='outline' size='icon'>
                        <FileSpreadsheet className='w-4 h-4 text-green-500' />
                    </Button>
                    <Button variant='outline' size='icon' onClick={() => fetchData(page)}>
                        <RefreshCw className='w-4 h-4' />
                    </Button>
                    <Button className='bg-navy hover:bg-navy-dark text-white'>
                        {t('sendEmail')}
                    </Button>
                </div>
            </div>

            <div className='bg-white p-4 rounded-lg border border-neutral-warm shadow-sm space-y-4'>
                <div className='flex flex-col md:flex-row justify-between gap-4'>
                    <Tabs value={stockType} onValueChange={(v) => setStockType(v as 'low' | 'out' | 'all')} className='w-full md:w-auto'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='all'>{t('all')}</TabsTrigger>
                            <TabsTrigger value='low'>{t('lowStocks')}</TabsTrigger>
                            <TabsTrigger value='out'>{t('outOfStocks')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className='flex items-center gap-2'>
                        <Switch id='notify' />
                        <Label htmlFor='notify' className='text-sm cursor-pointer'>{t('notify')}</Label>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row justify-between gap-4'>
                    <div className='relative w-full md:w-72'>
                        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={tCommon('search')}
                            value={inputValue}
                            onChange={handleInputChange}
                            className='pl-8'
                        />
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                        <Select value={warehouse} onValueChange={setWarehouse}>
                            <SelectTrigger className='w-[150px]'>
                                <SelectValue placeholder={t('warehouse')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('allWarehouses')}</SelectItem>
                                {warehouses.map((w) => (
                                    <SelectItem key={w._id} value={w._id}>
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={storeFilter} onValueChange={setStoreFilter}>
                            <SelectTrigger className='w-[150px]'>
                                <SelectValue placeholder={t('store')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('allStores')}</SelectItem>
                                {stores.map((s) => (
                                    <SelectItem key={s._id} value={s.slug}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className='w-[150px]'>
                                <SelectValue placeholder={t('category')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('allCategories')}</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='rounded-md border overflow-x-auto'>
                    <Table>
                        <TableHeader className='bg-gray-50'>
                            <TableRow>
                                <TableHead className='w-12'>
                                    <Checkbox />
                                </TableHead>
                                <TableHead className='whitespace-nowrap'>{t('warehouse')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('store')}</TableHead>
                                <TableHead className='min-w-[200px]'>{t('productName')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('category')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('sku')}</TableHead>
                                <TableHead className='whitespace-nowrap text-right'>{t('qty')}</TableHead>
                                <TableHead className='whitespace-nowrap text-right'>{t('qtyAlert')}</TableHead>
                                <TableHead className='text-right whitespace-nowrap'>{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center h-24'>
                                        {tCommon('loading')}
                                    </TableCell>
                                </TableRow>
                            ) : data?.products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center h-24'>
                                        {tCommon('noResults')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.products.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell>
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap text-gray-600'>
                                            {product.warehouse}
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap text-gray-600'>
                                            {product.store}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-3 min-w-[200px]'>
                                                <div className='relative w-10 h-10 rounded-md overflow-hidden border bg-gray-100 flex-shrink-0 flex items-center justify-center'>
                                                    {product.images?.[0]?.imgUrl ? (
                                                        <Image
                                                            src={product.images[0].imgUrl}
                                                            alt={product.name}
                                                            fill
                                                            className='object-cover'
                                                        />
                                                    ) : (
                                                        <span className='text-[10px] text-muted-foreground font-medium uppercase'>No Img</span>
                                                    )}
                                                </div>
                                                <span className='font-medium'>{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap'>{product.category}</TableCell>
                                        <TableCell className='whitespace-nowrap font-medium text-gray-500'>
                                            {product.sku}
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap text-right'>
                                            <span className={`font-bold ${product.countInStock === 0 ? 'text-red-500' : 'text-orange'}`}>
                                                {product.countInStock}
                                            </span>
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap text-right text-gray-600'>
                                            {product.quantityAlert}
                                        </TableCell>
                                        <TableCell className='text-right whitespace-nowrap'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit className='w-4 h-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='text-sm text-muted-foreground'>
                        {tCommon('rowsPerPage')}
                        <Select defaultValue='10'>
                            <SelectTrigger className='w-[70px] inline-flex ml-2 h-8'>
                                <SelectValue placeholder='10' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='5'>5</SelectItem>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='20'>20</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className='ml-2'>{tCommon('entries')}</span>
                    </div>

                    {(data?.totalPages ?? 0) > 1 && (
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handlePageChange('prev')}
                                disabled={Number(page) <= 1}
                                className='h-8 w-8'
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <div className='flex gap-1'>
                                {Array.from({ length: data?.totalPages || 0 }).map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={page === i + 1 ? 'default' : 'outline'}
                                        size='icon'
                                        className={`h-8 w-8 ${page === i + 1 ? 'bg-orange hover:bg-orange-dark text-white' : ''}`}
                                        onClick={() => {
                                            setPage(i + 1)
                                            fetchData(i + 1)
                                        }}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handlePageChange('next')}
                                disabled={Number(page) >= (data?.totalPages ?? 0)}
                                className='h-8 w-8'
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <EditLowStockModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                product={selectedProduct}
                warehouses={warehouses}
                stores={stores}
                onSuccess={() => fetchData(page)}
            />
        </div>
    )
}

export default LowStockList
