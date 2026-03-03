// eslint-disable removed
'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Plus,
    Search,
    Loader2,
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
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { useState, useEffect, useTransition, useCallback } from 'react'
import { formatCurrency, cn } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import GuidedHighlighter from '@/components/shared/guided-highlighter'

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
    const tOnboarding = useTranslations('admin.onboarding')
    const [page, setPage] = useState<number>(1)
    const [inputValue, setInputValue] = useState<string>('')
    const [data, setData] = useState<ProductListDataProps>()
    const [isPending, startTransition] = useTransition()

    const fetchData = useCallback((pageToFetch: number) => {
        startTransition(() => {
            getAllProductsForAdmin({
                query: inputValue,
                page: pageToFetch,
                category: 'all',
                brand: 'all',
                store,
            }).then((result) => {
                setData(result)
            })
        })
    }, [inputValue, store])

    useEffect(() => {
        fetchData(1)
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
        <div className='space-y-6'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h1 className='font-bold text-xl md:text-2xl text-navy tracking-tight'>{t('productList')}</h1>
                    <p className='text-sm md:text-md text-slate-500 font-medium'>{t('manageProducts')}</p>
                </div>
                <div className='flex flex-wrap gap-2 w-full xl:w-auto'>
                    <GuidedHighlighter
                        show={data?.totalProducts === 0}
                        message={tOnboarding('highlights.addProduct')}
                        position="bottom"
                        className='w-full sm:w-auto'
                    >
                        <Button asChild className='bg-orange hover:bg-orange-dark text-white w-full sm:w-auto shadow-lg shadow-orange-500/20 active:scale-95 transition-all py-6 md:py-2'>
                            <Link href={`/admin/${store}/products/create`}>
                                <Plus className='w-4 h-4 mr-2' /> {t('addProduct')}
                            </Link>
                        </Button>
                    </GuidedHighlighter>
                </div>
            </div>

            {!isPending && data?.totalProducts === 0 && !inputValue ? (
                <div className='bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-12 text-center'>
                    <div className='flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto'>
                        <div className='bg-orange/10 p-5 rounded-full shadow-inner animate-pulse'>
                            <Plus className='h-12 w-12 text-orange' />
                        </div>
                        <div className='space-y-2'>
                            <h3 className='text-xl md:text-2xl font-bold text-navy'>{t('emptyProductsTitle')}</h3>
                            <p className='text-sm md:text-base text-slate-600 leading-relaxed px-4'>
                                {t('emptyProductsDescription')}
                            </p>
                        </div>
                        <Button
                            asChild
                            className='bg-orange hover:bg-orange-dark text-white px-8 py-6 text-lg shadow-lg hover:shadow-orange/20 transition-all rounded-xl w-full sm:w-auto'
                        >
                            <Link href={`/admin/${store}/products/create`}>
                                <Plus className='mr-2 h-5 w-5' />
                                {t('emptyProductsCTA')}
                            </Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className='bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4'>
                    <div className='flex flex-col lg:flex-row justify-between gap-4'>
                        <div className='relative w-full md:max-w-sm'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
                            <Input
                                placeholder={tCommon('search')}
                                value={inputValue}
                                onChange={handleInputChange}
                                className='pl-10 h-11 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl'
                                disabled={data?.totalProducts === 0 && inputValue === ''}
                            />
                        </div>
                    </div>

                    <div className='rounded-xl border border-slate-100 overflow-hidden shadow-sm'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-slate-50/50 hover:bg-slate-50/50'>
                                    <TableHead className='font-semibold text-navy py-4 min-w-[150px] md:min-w-[200px]'>{t('productName')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4 hidden sm:table-cell'>{t('category')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4 hidden lg:table-cell'>{t('brand')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4'>{t('price')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4 hidden md:table-cell'>{t('unit')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4'>{t('quantity')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4 hidden md:table-cell'>{t('quantityAlert')}</TableHead>
                                    <TableHead className='whitespace-nowrap font-semibold text-navy py-4 hidden sm:table-cell'>{t('published')}</TableHead>
                                    <TableHead className='text-right whitespace-nowrap font-semibold text-navy py-4'>{tCommon('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isPending ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className='text-center py-20'>
                                            <div className='flex flex-col items-center gap-3'>
                                                <Loader2 className='h-8 w-8 animate-spin text-orange' />
                                                <p className='text-slate-400 font-medium uppercase tracking-widest text-xs'>{tCommon('loading')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data?.products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className='text-center py-20'>
                                            <div className='flex flex-col items-center justify-center space-y-3'>
                                                <div className='bg-slate-100 p-3 rounded-full'>
                                                    <Search className='h-6 w-6 text-slate-400' />
                                                </div>
                                                <p className='text-gray-500 font-medium px-4'>{inputValue ? t('noProductsFound') : tCommon('noResults')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.products.map((product) => (
                                        <TableRow key={product._id} className='hover:bg-slate-50/50 transition-colors'>
                                            <TableCell>
                                                <div className='flex items-center gap-3 min-w-[200px]'>
                                                    <div className='relative w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center'>
                                                        {product.images?.[0]?.imgUrl ? (
                                                            <Image
                                                                src={product.images[0].imgUrl}
                                                                alt={product.name}
                                                                fill
                                                                className='object-cover'
                                                            />
                                                        ) : (
                                                            <span className='text-[10px] text-slate-400 font-bold uppercase'>INV</span>
                                                        )}
                                                    </div>
                                                    <span className='font-bold text-navy truncate max-w-[250px]'>{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='whitespace-nowrap text-slate-600 hidden sm:table-cell'>{product.category}</TableCell>
                                            <TableCell className='whitespace-nowrap text-slate-600 hidden lg:table-cell'>{product.brand}</TableCell>
                                            <TableCell className='whitespace-nowrap font-bold text-navy'>
                                                <div className='flex flex-col'>
                                                    <span>{formatCurrency(product.listPrice)}</span>
                                                    <span className='text-[10px] text-slate-400 font-normal md:hidden'>{product.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='whitespace-nowrap text-slate-600 hidden md:table-cell'>{product.unit}</TableCell>
                                            <TableCell className='whitespace-nowrap font-bold'>
                                                <Badge
                                                    variant='outline'
                                                    className={cn(
                                                        'font-bold border-none px-2',
                                                        product.countInStock === 0 ? 'bg-rose-50 text-rose-600' :
                                                            product.countInStock <= (product.quantityAlert || 0) ? 'bg-amber-50 text-amber-600' :
                                                                'bg-emerald-50 text-emerald-600'
                                                    )}
                                                >
                                                    {product.countInStock}
                                                    <span className='ml-1 text-[10px] font-normal opacity-70 md:hidden'>{product.unit}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='whitespace-nowrap font-medium text-slate-400 hidden md:table-cell'>
                                                {product.quantityAlert}
                                            </TableCell>
                                            <TableCell className='whitespace-nowrap hidden sm:table-cell'>
                                                <Badge
                                                    className={cn(
                                                        'font-semibold',
                                                        product.isPublished
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                                                    )}
                                                >
                                                    {product.isPublished ? t('active') : t('inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <div className='flex justify-end gap-1'>
                                                    <Button
                                                        asChild
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50'
                                                    >
                                                        <Link href={`/admin/${store}/products/${product._id}/details`}>
                                                            <Eye className='w-4 h-4' />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
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
            )}
        </div>
    )
}

export default ProductList
