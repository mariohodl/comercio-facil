// eslint-disable removed
'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    FileSpreadsheet,
    FileText,
    Import,
    Plus,
    RefreshCw,
    Search,
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
    deleteProduct,
    getAllProductsForAdmin,
    getAllCategories,
    getAllBrands,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { useState, useEffect, useTransition, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

type ProductListDataProps = {
    products: IProduct[]
    totalPages: number
    totalProducts: number
    to: number
    from: number
}

const ProductList = ({ store }: { store: string }) => {
    const t = useTranslations('products')
    const tCommon = useTranslations('common')
    const [page, setPage] = useState<number>(1)
    const [inputValue, setInputValue] = useState<string>('')
    const [category, setCategory] = useState<string>('all')
    const [brand, setBrand] = useState<string>('all')
    const [data, setData] = useState<ProductListDataProps>()
    const [categories, setCategories] = useState<string[]>([])
    const [brands, setBrands] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()

    const fetchData = useCallback((pageToFetch: number) => {
        startTransition(() => {
            getAllProductsForAdmin({
                query: inputValue,
                page: pageToFetch,
                category,
                brand,
                store,
            }).then((result) => {
                setData(result)
            })
        })
    }, [inputValue, category, brand])

    useEffect(() => {
        const init = async () => {
            const [cats, brds] = await Promise.all([
                getAllCategories(),
                getAllBrands(),
            ])
            setCategories(cats)
            setBrands(brds)
            setBrands(brds)
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

    return (
        <div className='space-y-4'>
            <div className='flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4'>
                <div>
                    <h1 className='font-bold text-2xl'>{t('productList')}</h1>
                    <p className='text-muted-foreground text-sm'>{t('manageProducts')}</p>
                </div>
                <div className='flex flex-wrap gap-2 w-full xl:w-auto'>
                    <div className='flex gap-2 w-full sm:w-auto'>
                        <Button variant='outline' size='icon' className="shrink-0">
                            <FileText className='w-4 h-4 text-red-500' />
                        </Button>
                        <Button variant='outline' size='icon' className="shrink-0">
                            <FileSpreadsheet className='w-4 h-4 text-green-500' />
                        </Button>
                        <Button variant='outline' size='icon' onClick={() => fetchData(page)} className="shrink-0">
                            <RefreshCw className='w-4 h-4' />
                        </Button>
                    </div>
                    <Button asChild className='bg-orange hover:bg-orange-dark text-white flex-1 sm:flex-none'>
                        <Link href={`/admin/${store}/products/create`}>
                            <Plus className='w-4 h-4 mr-2' /> {t('addProduct')}
                        </Link>
                    </Button>
                    <Button variant='default' className='bg-navy hover:bg-navy-dark text-white flex-1 sm:flex-none'>
                        <Import className='w-4 h-4 mr-2' /> {t('importProduct')}
                    </Button>
                </div>
            </div>

            <div className='bg-white p-4 rounded-lg border border-neutral-warm shadow-sm space-y-4'>
                <div className='flex flex-col lg:flex-row justify-between gap-4'>
                    <div className='relative w-full lg:w-72'>
                        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={tCommon('search')}
                            value={inputValue}
                            onChange={handleInputChange}
                            className='pl-8 w-full'
                        />
                    </div>
                    <div className='flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto'>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className='w-full sm:w-[150px]'>
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
                        <Select value={brand} onValueChange={setBrand}>
                            <SelectTrigger className='w-full sm:w-[150px]'>
                                <SelectValue placeholder={t('brand')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('allBrands')}</SelectItem>
                                {brands.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b}
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
                                <TableHead className='whitespace-nowrap'>{t('sku')}</TableHead>
                                <TableHead className='min-w-[200px]'>{t('productName')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('category')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('brand')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('price')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('unit')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('quantity')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('quantityAlert')}</TableHead>
                                <TableHead className='whitespace-nowrap'>{t('published')}</TableHead>
                                <TableHead className='text-right whitespace-nowrap'>{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                <TableRow>
                                    <TableCell colSpan={10} className='text-center h-24'>
                                        {tCommon('loading')}
                                    </TableCell>
                                </TableRow>
                            ) : data?.products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className='text-center h-24'>
                                        {tCommon('noResults')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.products.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell className='font-medium text-gray-500 whitespace-nowrap'>
                                            {product.sku}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-3 min-w-[200px]'>
                                                <div className='relative w-10 h-10 rounded-md overflow-hidden border bg-gray-100 flex-shrink-0'>
                                                    <Image
                                                        src={product.images[0]?.imgUrl || '/placeholder.png'}
                                                        alt={product.name}
                                                        fill
                                                        className='object-cover'
                                                    />
                                                </div>
                                                <span className='font-medium text-blue-navy'>{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap'>{product.category}</TableCell>
                                        <TableCell className='whitespace-nowrap'>{product.brand}</TableCell>
                                        <TableCell className='whitespace-nowrap'>{formatCurrency(product.listPrice)}</TableCell>
                                        <TableCell className='whitespace-nowrap'>{product.unit}</TableCell>
                                        <TableCell className='whitespace-nowrap font-bold'>
                                            <span className={
                                                product.countInStock === 0 ? 'text-red-500' :
                                                    product.countInStock <= (product.quantityAlert || 0) ? 'text-orange' :
                                                        'text-green-600'
                                            }>
                                                {product.countInStock}
                                            </span>
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap font-medium text-gray-500'>
                                            {product.quantityAlert}
                                        </TableCell>
                                        <TableCell className='whitespace-nowrap'>
                                            <Badge
                                                variant='outline'
                                                className={product.isPublished
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                }
                                            >
                                                {product.isPublished ? t('active') : t('inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right whitespace-nowrap'>
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    asChild
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8 text-blue-500'
                                                >
                                                    <Link href={`/admin/${store}/products/${product._id}/details`}>
                                                        <Eye className='w-4 h-4' />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8 text-green-500'
                                                >
                                                    <Link href={`/admin/${store}/products/${product._id}`}>
                                                        <Edit className='w-4 h-4' />
                                                    </Link>
                                                </Button>
                                                <DeleteDialog
                                                    id={product._id}
                                                    action={deleteProduct}
                                                    callbackAction={() => fetchData(page)}
                                                />
                                            </div>
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
        </div>
    )
}

export default ProductList
