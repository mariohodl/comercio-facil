/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PlusCircle, ScanBarcode, Trash, RefreshCw, ChevronLeft, ChevronDown, X, Edit } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import BarcodeScannerDialog from '@/components/shared/barcode-scanner'
import { getSubCategoriesByCategory } from '@/lib/actions/sub-category.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { createProduct, updateProduct, deleteProductImg } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { toSlug } from '@/lib/utils'
import { IProductInput, ProductImage } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import Link from 'next/link'
import { IStore } from '@/lib/db/models/store.model'
import { IWarehouse } from '@/lib/db/models/warehouse.model'
import { CatalogAutocomplete } from '@/components/shared/catalog-autocomplete'

const useDefaultValues = false;

const productDefaultValues: IProductInput =
  process.env.NODE_ENV === 'development' && useDefaultValues
    ? {
      name: 'Sample Product',
      slug: 'sample-product',
      category: 'Materiales',
      sku: 'SAMPLE-SKU',
      images: [],
      brand: 'Generico',
      description: 'This is a sample description of the product.',
      listPrice: 99.99,
      discountPrice: 0,
      countInStock: 15,
      numReviews: 0,
      avgRating: 0,
      numSales: 0,
      isPublished: false,
      productId: 0,
      tags: [],
      ratingDistribution: [],
      reviews: [],
      store: '',
      warehouse: '',
      subCategory: '',
      unit: 'Piece',
      barcodeSymbology: 'Code 128',
      itemBarcode: '',
      productType: 'Single Product',
      taxType: 'Exclusive',
      tax: 0,
      discountType: 'Percentage',
      discountValue: 0,
      quantityAlert: 5,
      costPerUnit: 50,
      categoriaId: '',
      subCategoriaId: '',
      brandId: '',
      unitId: '',
    }
    : {
      name: '',
      slug: '',
      category: '',
      sku: '',
      images: [],
      brand: '',
      description: '',
      listPrice: 0,
      discountPrice: 0,
      countInStock: 0,
      numReviews: 0,
      avgRating: 0,
      numSales: 0,
      isPublished: false,
      productId: 0,
      tags: [],
      ratingDistribution: [],
      reviews: [],
      store: '',
      warehouse: '',
      subCategory: '',
      unit: '',
      barcodeSymbology: '',
      itemBarcode: '',
      productType: 'Single Product',
      taxType: '',
      tax: 0,
      discountType: '',
      discountValue: 0,
      quantityAlert: 0,
      costPerUnit: 0,
      categoriaId: '',
      subCategoriaId: '',
      brandId: '',
      unitId: '',
    }

type ProductFormProps = {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
  storeId: string
  categories?: { _id: string; categoryName: string; categorySlug: string }[]
  brands?: { _id: string; name: string; slug: string }[]
  units?: { _id: string; name: string; abbreviation: string }[]
  attributes?: { _id: string; name: string; values: string[] }[]
  stores?: IStore[]
  warehouses?: IWarehouse[]
  industry?: string
}

const ProductForm = ({
  type,
  product,
  productId,
  storeId,
  categories = [],
  brands = [],
  units = [],
  attributes = [],
  stores = [],
  warehouses = [],
  industry = 'general',
}: ProductFormProps) => {
  const router = useRouter()
  const t = useTranslations('products')
  const tCommon = useTranslations('common')

  // Safely deduplicate units and brands from props to prevent UI crashes
  const uniqueUnits = Array.from(new Map(units.map(u => [u.name.toLowerCase(), u])).values())
    .sort((a, b) => a.name.localeCompare(b.name))

  const uniqueBrands = Array.from(new Map(brands.map(b => [b.name.toLowerCase(), b])).values())
    .sort((a, b) => a.name.localeCompare(b.name))

  const [subCategories, setSubCategories] = useState<any[]>([])
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [barcodeScanned, setBarcodeScanned] = useState(false)
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
  const variantBuilderRef = useRef<HTMLDivElement>(null)

  // State for the new variant builder
  const [builderAttributes, setBuilderAttributes] = useState<Record<string, string[]>>({})
  const [newVariantData, setNewVariantData] = useState({
    price: 0,
    listPrice: 0,
    discountPrice: 0,
    discountType: 'Percentage',
    discountValue: 0,
    countInStock: 0,
    costPerUnit: 0,
    sku: '',
    barcode: '',
    taxType: 'Exclusive',
    tax: 0,
    images: [] as ProductImage[]
  })

  const { showSuccess, showError } = useToast()

  const form = useForm<IProductInput>({
    resolver: type === 'Update' ? zodResolver(ProductUpdateSchema) : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  // Watch for changes in product type to reset fields if needed
  const productType = form.watch('productType')
  const selectedCategory = form.watch('category')
  const productName = form.watch('name')

  useEffect(() => {
    if (type === 'Create' && productName) {
      form.setValue('slug', toSlug(productName))
    }
  }, [productName, type, form])

  // Clear main barcode when switching to Variable Product to avoid confusion/stale data
  useEffect(() => {
    if (productType === 'Variable Product') {
      form.setValue('itemBarcode', '')
      setBarcodeScanned(false)
    }
  }, [productType, form])

  // Calculate variant discount price automatically
  useEffect(() => {
    const listPrice = Number(newVariantData.listPrice) || 0
    const discountValue = Number(newVariantData.discountValue) || 0
    const discountType = newVariantData.discountType

    let calculatedDiscountPrice = 0

    if (discountType && discountValue > 0 && listPrice > 0) {
      if (discountType === 'Percentage') {
        calculatedDiscountPrice = listPrice - (listPrice * discountValue / 100)
      } else if (discountType === 'Fixed') {
        calculatedDiscountPrice = listPrice - discountValue
      }
      calculatedDiscountPrice = Math.max(0, calculatedDiscountPrice)
    }

    setNewVariantData(prev => {
      // Only update if value changed to avoid infinite loops
      if (prev.discountPrice !== calculatedDiscountPrice) {
        return { ...prev, discountPrice: calculatedDiscountPrice }
      }
      return prev
    })
  }, [newVariantData.listPrice, newVariantData.discountValue, newVariantData.discountType])

  useEffect(() => {
    if (stores && stores.length === 1 && !form.getValues('store')) {
      form.setValue('store', stores[0].slug, { shouldValidate: true })
    }
  }, [stores, form])

  useEffect(() => {
    if (warehouses && warehouses.length === 1 && !form.getValues('warehouse')) {
      form.setValue('warehouse', warehouses[0].slug, { shouldValidate: true })
    }
  }, [warehouses, form])

  // Generate initial SKU for the builder when product name changes or storeId loads
  useEffect(() => {
    if (productType === 'Variable Product') {
      const namePart = productName ? productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(6, 'X') : 'PROD'
      const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase().padEnd(8, 'X') : 'STOREID'
      const mainSku = form.getValues('sku') || 'SKU'
      const mainSkuLast5 = mainSku.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase().padStart(5, '0')
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const generatedSku = `${namePart}-${storePart}-${mainSkuLast5}-${randomSuffix}`

      setNewVariantData(prev => ({ ...prev, sku: generatedSku }))
    }
  }, [productName, storeId, productType, form])

  useEffect(() => {
    if (type === 'Create' && productName) {
      const currentSku = form.getValues('sku')
      const namePart = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(3, 'X')
      const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'STOR'

      let randomPart = '00000'
      // Try to preserve existing random part if format matches
      if (currentSku && currentSku.includes(storePart)) {
        const parts = currentSku.split('-')
        const lastPart = parts[parts.length - 1]
        if (/^\d{5}$/.test(lastPart)) {
          randomPart = lastPart
        } else {
          randomPart = String(Math.floor(10000 + Math.random() * 90000))
        }
      } else {
        randomPart = String(Math.floor(10000 + Math.random() * 90000))
      }

      const sku = `${namePart}-${storePart}-${randomPart}`
      if (sku !== currentSku) {
        form.setValue('sku', sku)
      }
    }
  }, [productName, type, storeId, form])

  const selectedCategoryId = form.watch('categoriaId')

  useEffect(() => {
    const fetchSubCategories = async () => {
      let categoryId = selectedCategoryId

      if (!categoryId && selectedCategory) {
        const found = categories.find(c => c.categoryName === selectedCategory)
        categoryId = found?._id
      }

      if (!categoryId) {
        setSubCategories([])
        form.setValue('subCategory', '')
        return
      }

      const subs = await getSubCategoriesByCategory(categoryId)
      setSubCategories(subs)

      const currentSub = form.getValues('subCategory')
      const isValid = subs.some(s => s.name === currentSub) || currentSub === 'None'
      if (currentSub && !isValid) {
        form.setValue('subCategory', '')
      }
    }

    fetchSubCategories()
  }, [selectedCategory, selectedCategoryId, categories, form])

  // Watch pricing fields for automatic discount calculation
  const discountType = form.watch('discountType')
  const listPrice = form.watch('listPrice')
  const discountValue = form.watch('discountValue')

  useEffect(() => {
    const listPriceNum = Number(listPrice) || 0
    const discountValueNum = Number(discountValue) || 0

    let calculatedDiscountPrice = 0

    if (discountType && discountValueNum > 0 && listPriceNum > 0) {
      if (discountType === 'Percentage') {
        calculatedDiscountPrice = listPriceNum - (listPriceNum * discountValueNum / 100)
      } else if (discountType === 'Fixed') {
        calculatedDiscountPrice = listPriceNum - discountValueNum
      }

      // Ensure discount price is not negative and is a valid number
      calculatedDiscountPrice = Math.max(0, calculatedDiscountPrice)
    }

    // Only update if the value is a valid number
    if (!isNaN(calculatedDiscountPrice)) {
      form.setValue('discountPrice', calculatedDiscountPrice)
    }
  }, [listPrice, discountType, discountValue, form])

  // Hardware Scanner Integration
  useBarcodeScanner((barcode) => {
    if (productType === 'Variable Product') {
      setNewVariantData(prev => ({ ...prev, barcode }))
      showSuccess(t('barcodeScannedSuccessfully') + ': ' + barcode)
    } else {
      form.setValue('itemBarcode', barcode)
      setBarcodeScanned(true)
      showSuccess(t('barcodeScannedSuccessfully') + ': ' + barcode)
    }
  }, type === 'Create' || type === 'Update')



  async function onSubmit(values: IProductInput) {
    let finalValues = { ...values }

    // If Variable Product, calculate aggregates from variants
    if (values.productType === 'Variable Product' && values.variants && values.variants.length > 0) {
      const totalStock = values.variants.reduce((acc: number, curr: any) => acc + (Number(curr.countInStock) || 0), 0)
      const minListPrice = Math.min(...values.variants.map((v: any) => Number(v.listPrice) || 0))
      const maxCost = Math.max(...values.variants.map((v: any) => Number(v.costPerUnit) || 0))

      // Calculate attributes summary from variants
      const attributesSummary: Record<string, Set<string>> = {}
      values.variants.forEach((variant: any) => {
        variant.attributes.forEach((attr: any) => {
          if (!attributesSummary[attr.name]) {
            attributesSummary[attr.name] = new Set()
          }
          attributesSummary[attr.name].add(attr.value)
        })
      })

      const attributes = Object.entries(attributesSummary).map(([name, valuesSet]) => ({
        name,
        values: Array.from(valuesSet) as string[]
      }))

      finalValues = {
        ...finalValues,
        countInStock: totalStock,
        listPrice: minListPrice,
        costPerUnit: maxCost,
        attributes: attributes,
        discountPrice: 0
      }
    }

    if (type === 'Create') {
      const res = await createProduct(finalValues)
      if (!res.success) {
        showError(res.message)
      } else {
        showSuccess(res.message)
        router.push(`/admin/${storeId}/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/${storeId}/products`)
        return
      }
      const res = await updateProduct({ ...finalValues, _id: productId })
      if (!res.success) {
        showError(res.message)
      } else {
        showSuccess(res.message)
        router.push(`/admin/${storeId}/products`)
      }
    }
  }

  const images = form.watch('images')

  const handleRemoveImage = async (image: ProductImage) => {
    if (!productId) {
      showError(t('productIdRequired'))
      return
    }
    const res = await deleteProductImg(productId, image.imgKey)
    if (res.success) {
      showSuccess(t('imageDeletedSuccessfully'))
      form.setValue('images', images.filter((img) => img.imgKey !== image.imgKey))
    } else {
      showError(res.errorMessage || t('failedToDeleteImage'))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-navy truncate">{type === 'Create' ? t('createProduct') : t('updateProduct')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('createNewProduct')}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href={`/admin/${storeId}/products`}>
            <Button className="bg-navy hover:bg-navy/90 text-white h-8 px-3 sm:h-10 sm:px-4">
              <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{tCommon('back')}</span>
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          method='post'
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            showError(t('checkFormErrors'))
          })}
          className='space-y-8'
        >
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <span className="text-orange">ⓘ</span> {t('productInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name='store'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('store')} <span className="text-red-500">*</span></FormLabel>
                      <Select key={field.value} onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.length > 0 ? (
                            stores.map((store) => (
                              <SelectItem key={store._id} value={store.slug}>
                                {store.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-stores" disabled>
                              No stores available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='warehouse'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('warehouse')} <span className="text-red-500">*</span></FormLabel>
                      <Select key={field.value} onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.length > 0 ? (
                            warehouses.map((warehouse) => (
                              <SelectItem key={warehouse._id} value={warehouse.slug}>
                                {warehouse.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-warehouses" disabled>
                              {t('noWarehousesAvailable') || 'No warehouses available'}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('productName')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder={t('enterProductName')} {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('slug')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input placeholder={t('enterProductSlug')} {...field} disabled className="h-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-3'>
                <FormField
                  control={form.control}
                  name='sku'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('sku')} <span className="text-red-500">*</span></FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="w-full flex-1">
                          <FormControl>
                            <Input placeholder={t('enterBarcode')} {...field} className="h-10" />
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          className="bg-orange hover:bg-orange-dark text-white h-10 shrink-0 w-full sm:w-auto"
                          onClick={() => {
                            const name = form.getValues('name')
                            if (!name) {
                              showError(t('enterProductNameFirst'))
                              return
                            }
                            const namePart = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(3, 'X')
                            const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'STOR'
                            const randomPart = Math.floor(10000 + Math.random() * 90000)
                            const sku = `${namePart}-${storePart}-${randomPart}`
                            form.setValue('sku', sku)
                          }}
                        >
                          {t('generate')}
                        </Button>
                      </div>
                      <FormMessage />


                    </FormItem>
                  )}
                />

              </div>

              <div className='grid grid-cols-2 gap-2 items-start'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('category')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <CatalogAutocomplete
                          value={field.value}
                          initialOptions={categories.map(c => ({ _id: c._id, name: c.categoryName, isGlobal: false }))}
                          industry={industry}
                          mode="category"
                          placeholder={t('select')}
                          onSelect={(option) => {
                            if (option) {
                              form.setValue('category', option.name)
                              form.setValue('categoriaId', option._id)
                              form.setValue('isCustomCategory', false)
                              // Reset subcategory when category changes
                              form.setValue('subCategory', '')
                              setSubCategories([])
                            }
                          }}
                          onCustomCreate={(name) => {
                            form.setValue('category', name)
                            form.setValue('categoriaId', undefined)
                            form.setValue('isCustomCategory', true)
                            // Reset subcategory
                            form.setValue('subCategory', '')
                            setSubCategories([])
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='subCategory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('subCategory')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <CatalogAutocomplete
                          value={field.value}
                          initialOptions={subCategories.map(s => ({ _id: (s as any)._id || s.slug, name: s.name, isGlobal: s.isGlobal }))}
                          industry={industry}
                          mode="subCategory"
                          categoryId={selectedCategoryId}
                          placeholder={t('select')}
                          onSelect={(option) => {
                            if (option) {
                              form.setValue('subCategory', option.name)
                              form.setValue('subCategoriaId', option._id)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name='brand'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('brand')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <CatalogAutocomplete
                          value={field.value || ''}
                          initialOptions={uniqueBrands.map(b => ({ _id: (b as any)._id || b.slug, name: b.name, isGlobal: (b as any).isGlobal }))}
                          industry={industry}
                          mode="brand"
                          placeholder={t('select')}
                          onSelect={(option) => {
                            if (option) {
                              form.setValue('brand', option.name)
                              form.setValue('brandId', option._id)
                              form.setValue('isCustomBrand', false)
                            }
                          }}
                          onCustomCreate={(name) => {
                            form.setValue('brand', name)
                            form.setValue('brandId', undefined)
                            form.setValue('isCustomBrand', true)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='unit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('unit')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <CatalogAutocomplete
                          value={field.value}
                          initialOptions={uniqueUnits.map(u => ({ _id: (u as any)._id || u.name, name: u.name, abbreviation: u.abbreviation, isGlobal: (u as any).isGlobal }))}
                          industry={industry}
                          mode="unit"
                          placeholder={t('select')}
                          onSelect={(option) => {
                            if (option) {
                              form.setValue('unit', option.name)
                              form.setValue('unitId', option._id)
                            }
                          }}
                          onCustomCreate={(name) => {
                            form.setValue('unit', name)
                            form.setValue('unitId', undefined)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name='barcodeSymbology'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('barcodeSymbology')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Code 128">Code 128</SelectItem>
                          <SelectItem value="Code 39">Code 39</SelectItem>
                          <SelectItem value="EAN-13">EAN-13</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-2'>
                <FormField
                  control={form.control}
                  name='itemBarcode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{t('itemBarcode')} {productType === 'Single Product' && <span className="text-red-500">*</span>}</FormLabel>
                      <div className="flex flex-row gap-1">
                        <div className="flex-1 min-w-0">
                          <FormControl>
                            <Input
                              placeholder={t('enterBarcode')}
                              {...field}
                              readOnly={barcodeScanned}
                              className={`h-10 ${barcodeScanned ? 'bg-muted cursor-not-allowed' : ''}`}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                field.onChange(value)
                                setBarcodeScanned(false) // Allow editing if user types
                              }}
                            />
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setIsScannerOpen(true)}
                          title={t('scanBarcode')}
                          className="h-10 w-10 shrink-0"
                        >
                          <ScanBarcode className="h-4 w-4" />
                        </Button>
                        {barcodeScanned ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              form.setValue('itemBarcode', '')
                              setBarcodeScanned(false)
                            }}
                            title={t('clearScannedBarcode')}
                            className="h-10 w-10 shrink-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            className="bg-orange hover:bg-orange-dark text-white h-10 shrink-0 px-3 text-xs"
                            onClick={() => {
                              const symbology = form.getValues('barcodeSymbology')
                              let barcode = ''
                              if (symbology === 'EAN-13') {
                                // Generate 12 digits, calculate checksum
                                let sum = 0;
                                for (let i = 0; i < 12; i++) {
                                  const digit = Math.floor(Math.random() * 10);
                                  barcode += digit;
                                  sum += digit * (i % 2 === 0 ? 1 : 3);
                                }
                                const checksum = (10 - (sum % 10)) % 10;
                                barcode += checksum;
                              } else {
                                // Simple random string for Code 128 and Code 39
                                barcode = Math.random().toString(36).substring(2, 12).toUpperCase();
                              }
                              form.setValue('itemBarcode', barcode)
                              setBarcodeScanned(false)
                            }}
                          >
                            {t('generate')}
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('enterProductDescription')}
                        className='resize-none min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Stocks Section */}
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <span className="text-orange">ⓘ</span> {t('pricingAndStocks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              <FormField
                control={form.control}
                name='productType'
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('productType')} <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          if (value === 'Single Product') {
                            form.setValue('attributes', [])
                          }
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="Single Product" id="single" className="text-orange border-orange" />
                          <FormLabel htmlFor="single" className="font-normal">{t('singleProduct')}</FormLabel>
                          <RadioGroupItem value="Variable Product" id="variable" className="text-orange border-orange ml-4" />
                          <FormLabel htmlFor="variable" className="font-normal">{t('variableProduct')}</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('productType') === 'Variable Product' && (
                <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card ref={variantBuilderRef} className="border-neutral-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-semibold text-navy flex items-center gap-2">
                            <span className="text-orange">✨</span> {t('variantBuilder')}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{t('variantBuilderDescription')}</p>
                        </div>
                        {attributes && attributes.length > 0 && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            {attributes.length} {t('attributesAvailable')}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      {attributes && attributes.length > 0 ? (
                        <div className="space-y-4">
                          {/* Step 1: Attributes */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs">1</span>
                              {t('selectAttributes')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {attributes.map((attr) => (
                                <div key={attr._id} className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase">{attr.name}</label>
                                  <Select
                                    value={builderAttributes[attr.name]?.[0] || ''}
                                    onValueChange={(value) => {
                                      if (value === '__clear__') {
                                        const newAttrs = { ...builderAttributes }
                                        delete newAttrs[attr.name]
                                        setBuilderAttributes(newAttrs)
                                      } else {
                                        setBuilderAttributes(prev => ({
                                          ...prev,
                                          [attr.name]: [value]
                                        }))
                                      }
                                    }}
                                  >
                                    <SelectTrigger className={`h-10 transition-all ${builderAttributes[attr.name]?.[0] ? 'bg-orange/5 border-orange text-orange ring-1 ring-orange/20' : 'bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'}`}>
                                      <SelectValue placeholder={t('select')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="__clear__" className="text-red-500 focus:text-red-500 focus:bg-red-50">
                                        <span className="italic text-xs">{t('clearSelection')}</span>
                                      </SelectItem>
                                      {attr.values.map((val) => (
                                        <SelectItem key={val} value={val}>
                                          {val}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-gray-100"></div>

                          {/* Step 2 & 3: Details */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left Column: Pricing & Inventory */}
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs">2</span>
                                {t('pricingAndInventory')}
                              </h3>
                              {/* Quantity - Smaller standalone field */}
                              <div className="space-y-2 max-w-xs">
                                <label className="text-xs font-medium text-gray-500 uppercase">{t('quantity')} <span className="text-red-500">*</span></label>
                                <Input
                                  type="number"
                                  value={newVariantData.countInStock}
                                  onChange={(e) => setNewVariantData(prev => ({ ...prev, countInStock: Number(e.target.value) }))}
                                  placeholder="0"
                                  className="h-10 font-medium"
                                />
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase">{t('costPerUnit')} <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <Input
                                      type="number"
                                      value={newVariantData.costPerUnit}
                                      onChange={(e) => setNewVariantData(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                                      placeholder="0.00"
                                      className="pl-7 h-10 font-medium"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase">{t('listPrice')} <span className="text-red-500">*</span></label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <Input
                                      type="number"
                                      value={newVariantData.listPrice}
                                      onChange={(e) => setNewVariantData(prev => ({ ...prev, listPrice: Number(e.target.value) }))}
                                      placeholder="0.00"
                                      className="pl-7 h-10 font-medium"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase">{t('discountPrice')}</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <Input
                                      type="number"
                                      value={newVariantData.discountPrice}
                                      readOnly
                                      className="pl-7 h-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase">{t('discountType')}</label>
                                  <Select
                                    value={newVariantData.discountType || 'Percentage'}
                                    onValueChange={(value) => setNewVariantData(prev => ({ ...prev, discountType: value }))}
                                  >
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder={t('select')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Percentage">{t('percentage')}</SelectItem>
                                      <SelectItem value="Fixed">{t('fixed')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase">{t('discountValue')}</label>
                                  <Input
                                    type="number"
                                    value={newVariantData.discountValue}
                                    onChange={(e) => setNewVariantData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                                    placeholder="0"
                                    className="h-10"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">{t('taxType')} <span className="text-red-500">*</span></label>
                                <Select
                                  value={newVariantData.taxType}
                                  onValueChange={(value) => setNewVariantData(prev => ({ ...prev, taxType: value }))}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder={t('select')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Exclusive">{t('exclusive')}</SelectItem>
                                    <SelectItem value="Inclusive">{t('inclusive')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs">3</span>
                                {t('identifiersAndMedia')}
                              </h3>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">{t('sku')} <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newVariantData.sku}
                                    readOnly
                                    className="h-10 bg-gray-50 font-mono text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => {
                                      const namePart = productName ? productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(6, 'X') : 'PROD'
                                      const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase().padEnd(8, 'X') : 'STOREID'
                                      const mainSku = form.getValues('sku') || 'SKU'
                                      const mainSkuLast5 = mainSku.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase().padStart(5, '0')
                                      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
                                      const generatedSku = `${namePart}-${storePart}-${mainSkuLast5}-${randomSuffix}`
                                      setNewVariantData(prev => ({ ...prev, sku: generatedSku }))
                                    }}
                                    title={t('regenerateSku')}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">{t('barcode')} <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      value={newVariantData.barcode}
                                      onChange={(e) => setNewVariantData(prev => ({ ...prev, barcode: e.target.value }))}
                                      placeholder={t('scanOrEnterBarcode')}
                                      className={`pl-9 h-10 ${newVariantData.barcode ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                                      readOnly={!!newVariantData.barcode}
                                    />
                                    {newVariantData.barcode && (
                                      <button
                                        type="button"
                                        onClick={() => setNewVariantData(prev => ({ ...prev, barcode: '' }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => setIsScannerOpen(true)}
                                    title={t('scanBarcode')}
                                  >
                                    <ScanBarcode className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    className="h-10 bg-orange text-white hover:bg-orange/90 shrink-0"
                                    onClick={() => {
                                      const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString()
                                      setNewVariantData(prev => ({ ...prev, barcode: randomBarcode }))
                                    }}
                                  >
                                    {t('generate')}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">{t('variantImages')} <span className="text-red-500">*</span></label>
                                <div className="p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                  {newVariantData.images.length < 2 && (
                                    <div className="flex justify-center mb-4">
                                      <UploadButton
                                        endpoint="imageUploader"
                                        onClientUploadComplete={(res) => {
                                          if (res) {
                                            const newImages = res.map(file => ({
                                              imgUrl: file.url,
                                              imgKey: file.key
                                            }))
                                            setNewVariantData(prev => ({
                                              ...prev,
                                              images: [...prev.images, ...newImages].slice(0, 2)
                                            }))
                                            showSuccess(t('imageUploadedSuccessfully'))
                                          }
                                        }}
                                        onUploadError={(error: Error) => {
                                          showError(`Upload failed: ${error.message}`)
                                        }}
                                        className="ut-button:bg-white ut-button:text-orange ut-button:border-orange ut-button:border ut-button:hover:bg-orange/5 ut-allowed-content:hidden"
                                        content={{
                                          button({ ready }) {
                                            if (ready) return <div className="flex items-center gap-2 text-sm"><PlusCircle className="w-4 h-4" /> {t('uploadImage')}</div>
                                            return "Loading..."
                                          }
                                        }}
                                      />
                                    </div>
                                  )}

                                  {newVariantData.images.length > 0 ? (
                                    <div className="flex gap-3 justify-center">
                                      {newVariantData.images.map((image, idx) => (
                                        <div key={idx} className="relative w-20 h-20 border rounded-md overflow-hidden shadow-sm group">
                                          <Image
                                            src={image.imgUrl}
                                            alt={`Variant image ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="icon"
                                              className="h-8 w-8 rounded-full"
                                              onClick={() => {
                                                setNewVariantData(prev => ({
                                                  ...prev,
                                                  images: prev.images.filter((_, i) => i !== idx)
                                                }))
                                              }}
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center text-xs text-muted-foreground">
                                      {t('noImagesUploaded')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-6 border-t border-gray-100">
                            <Button
                              type="button"
                              size="lg"
                              onClick={() => {
                                // Validate that all attributes have a selection
                                const selectedAttrNames = Object.keys(builderAttributes)
                                if (selectedAttrNames.length === 0) {
                                  showError(t('selectAtLeastOneAttribute'))
                                  return
                                }

                                // Validate quantity is greater than 0
                                if (!newVariantData.countInStock || newVariantData.countInStock <= 0) {
                                  showError(t('quantityRequired'))
                                  return
                                }

                                // Validate cost per unit is greater than 0
                                if (!newVariantData.costPerUnit || newVariantData.costPerUnit <= 0) {
                                  showError(t('costPerUnitRequired'))
                                  return
                                }

                                // Validate list price is greater than 0
                                if (!newVariantData.listPrice || newVariantData.listPrice <= 0) {
                                  showError(t('listPriceRequired'))
                                  return
                                }

                                // Validate SKU is present
                                if (!newVariantData.sku || newVariantData.sku.trim() === '') {
                                  showError(t('skuRequired'))
                                  return
                                }

                                // Validate barcode is present
                                if (!newVariantData.barcode || newVariantData.barcode.trim() === '') {
                                  showError(t('barcodeRequired'))
                                  return
                                }

                                // Validate at least one image
                                if (!newVariantData.images || newVariantData.images.length === 0) {
                                  showError(t('atLeastOneImageRequired'))
                                  return
                                }

                                const newVariant = {
                                  attributes: selectedAttrNames.map(name => ({
                                    name,
                                    value: builderAttributes[name][0]
                                  })),
                                  price: newVariantData.price,
                                  listPrice: newVariantData.listPrice,
                                  countInStock: newVariantData.countInStock,
                                  costPerUnit: newVariantData.costPerUnit,
                                  discountPrice: newVariantData.discountPrice,
                                  discountType: newVariantData.discountType,
                                  discountValue: newVariantData.discountValue,
                                  sku: newVariantData.sku,
                                  barcode: newVariantData.barcode,
                                  taxType: newVariantData.taxType,
                                  tax: newVariantData.tax,
                                  images: newVariantData.images
                                }

                                const currentVariants = form.getValues('variants') || []

                                // Check if we're editing an existing variant
                                if (editingVariantIndex !== null) {
                                  // Update the existing variant
                                  const updatedVariants = [...currentVariants]
                                  updatedVariants[editingVariantIndex] = newVariant
                                  form.setValue('variants', updatedVariants)
                                  showSuccess(t('variantUpdatedSuccessfully'))
                                  setEditingVariantIndex(null)
                                } else {
                                  // Add new variant
                                  form.setValue('variants', [...currentVariants, newVariant])
                                  showSuccess(t('variantAddedSuccessfully'))
                                }

                                // Regenerate SKU for next variant
                                const namePart = productName ? productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(6, 'X') : 'PROD'
                                const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase().padEnd(8, 'X') : 'STOREID'
                                const mainSku = form.getValues('sku') || 'SKU'
                                const mainSkuLast5 = mainSku.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase().padStart(5, '0')
                                const randomSuffix = Math.floor(1000 + Math.random() * 9000)
                                const generatedSku = `${namePart}-${storePart}-${mainSkuLast5}-${randomSuffix}`

                                // Reset builder
                                setBuilderAttributes({})
                                setNewVariantData(prev => ({
                                  ...prev,
                                  sku: generatedSku,
                                  barcode: '',
                                  images: []
                                }))
                              }}
                              className="bg-navy hover:bg-navy/90 text-white min-w-[200px]"
                            >
                              <PlusCircle className="mr-2 h-5 w-5" />
                              {editingVariantIndex !== null ? t('updateVariant') : t('addVariantToProduct')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏷️</span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-900">{t('noAttributesFound')}</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">{t('createAttributesDescription')}</p>
                          </div>
                          <Link href={`/admin/${storeId}/inventory/attributes`}>
                            <Button variant="outline" className="mt-2 text-orange border-orange hover:bg-orange/5">
                              {t('createAttributes')}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Generated Variants Table */}
                  {form.watch('variants') && form.watch('variants').length > 0 && (
                    <Card className="border-neutral-200 shadow-sm overflow-hidden">
                      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                        <CardTitle className="text-base font-semibold text-navy flex items-center justify-between">
                          <span>{t('generatedVariants')}</span>
                          <span className="text-xs font-normal text-muted-foreground bg-white px-2 py-1 rounded border">
                            {form.watch('variants').length} {t('variants')}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3 font-medium">{t('variant')}</th>
                              <th className="px-6 py-3 font-medium">{t('sku')} / {t('barcode')}</th>
                              <th className="px-6 py-3 font-medium text-right">{t('cost')}</th>
                              <th className="px-6 py-3 font-medium text-right">{t('price')}</th>
                              <th className="px-6 py-3 font-medium text-center">{t('stock')}</th>
                              <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(form.watch('variants') || []).map((variant: any, index: number) => {
                              return (
                                <tr key={index} className="bg-white hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-start gap-4">
                                      {variant.images && variant.images.length > 0 ? (
                                        <div className="relative w-12 h-12 border rounded-md overflow-hidden shrink-0">
                                          <Image
                                            src={variant.images[0].imgUrl}
                                            alt="Variant thumbnail"
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center shrink-0 text-gray-400">
                                          <span className="text-xs">No Img</span>
                                        </div>
                                      )}
                                      <div className="space-y-1">
                                        {variant.attributes.map((variantAttr: any, attrIndex: number) => (
                                          <div key={attrIndex} className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-500 font-medium">{variantAttr.name}:</span>
                                            <span className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{variantAttr.value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">{variant.sku}</span>
                                      {variant.barcode && (
                                        <span className="font-mono text-xs text-gray-400 flex items-center gap-1">
                                          <ScanBarcode className="w-3 h-3" /> {variant.barcode}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right font-medium text-gray-600">
                                    ${Number(variant.costPerUnit).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-right font-medium text-navy">
                                    ${Number(variant.discountPrice && variant.discountPrice > 0 ? variant.discountPrice : variant.listPrice).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {variant.countInStock}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                                        onClick={() => {
                                          // Populate the builder with this variant's data
                                          const variantToEdit = variant

                                          // Set attributes
                                          const attrs: Record<string, string[]> = {}
                                          variantToEdit.attributes.forEach((attr: any) => {
                                            attrs[attr.name] = [attr.value]
                                          })
                                          setBuilderAttributes(attrs)

                                          // Set variant data
                                          setNewVariantData({
                                            sku: variantToEdit.sku,
                                            costPerUnit: variantToEdit.costPerUnit,
                                            listPrice: variantToEdit.listPrice,
                                            discountPrice: variantToEdit.discountPrice || 0,
                                            discountType: variantToEdit.discountType || 'Percentage',
                                            discountValue: variantToEdit.discountValue || 0,
                                            countInStock: variantToEdit.countInStock,
                                            barcode: variantToEdit.barcode || '',
                                            taxType: variantToEdit.taxType || 'Exclusive',
                                            tax: variantToEdit.tax || 0,
                                            images: variantToEdit.images || [],
                                            price: variantToEdit.discountPrice && variantToEdit.discountPrice > 0 ? variantToEdit.discountPrice : variantToEdit.listPrice
                                          })

                                          setEditingVariantIndex(index)

                                          // Scroll to builder
                                          setTimeout(() => {
                                            variantBuilderRef.current?.scrollIntoView({
                                              behavior: 'smooth',
                                              block: 'start'
                                            })
                                          }, 100)
                                        }}
                                        title={t('editVariant')}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => {
                                          const newVariants = [...(form.getValues('variants') || [])]
                                          newVariants.splice(index, 1)
                                          form.setValue('variants', newVariants)
                                          if (editingVariantIndex === index) {
                                            setEditingVariantIndex(null)
                                          }
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {form.watch('productType') === 'Single Product' && (
                <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                    {/* Inventory Section */}
                    <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white h-full">
                      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                          <span className="text-orange">📦</span> {t('inventory')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name='countInStock'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('quantity')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input type='number' placeholder={t('enterQuantity')} {...field} className="pl-9 h-10" />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">#</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='quantityAlert'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('quantityAlert')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input type='number' placeholder={t('enterQuantityAlert')} {...field} className="pl-9 h-10" />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">⚠️</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pricing Section */}
                    <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white h-full">
                      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                          <span className="text-orange">💰</span> {t('pricing')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-3">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          <FormField
                            control={form.control}
                            name='costPerUnit'
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-sm whitespace-nowrap">{t('costPerUnit')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input type='number' step='0.01' placeholder={t('enterCost')} {...field} className="pl-9 h-10" />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">$</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='listPrice'
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-sm whitespace-nowrap">{t('listPrice')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input type='number' step='0.01' placeholder={t('enterListPrice')} {...field} className="pl-9 h-10" />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">$</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='discountPrice'
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-sm whitespace-nowrap">{t('discountPrice')}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type='number'
                                      step='0.01'
                                      placeholder={t('calculatedPrice')}
                                      {...field}
                                      disabled
                                      className="bg-gray-50 pl-9"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">$</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name='taxType'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('taxType')} <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder={t('select')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Exclusive">{t('exclusive')}</SelectItem>
                                    <SelectItem value="Inclusive">{t('inclusive')}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='tax'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('tax')} <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                                  <FormControl>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder={t('select')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="0">0%</SelectItem>
                                    <SelectItem value="16">16%</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Discount Section */}
                    <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white h-full">
                      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                          <span className="text-orange">🏷️</span> {t('discount')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name='discountType'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('discountType')} <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder={t('select')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Percentage">{t('percentage')}</SelectItem>
                                    <SelectItem value="Fixed">{t('fixed')}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='discountValue'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('discountValue')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input type='number' placeholder={t('enterDiscount')} {...field} className="pl-9 h-10" />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">%</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Section - Always visible for all product types */}
          <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-3">
              <FormField
                control={form.control}
                name='isPublished'
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-gray-50/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium text-navy">{t('published')}</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {t('makeProductVisible')}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-orange"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <span className="text-orange">📷</span> {t('images')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='images'
                render={() => (
                  <FormItem className='w-full'>
                    <FormLabel>{t('images')}</FormLabel>
                    <div className='space-y-2 mt-2 min-h-48 border-2 border-dashed border-neutral-200 rounded-lg p-4 flex flex-col items-center justify-center'>
                      <div className='flex justify-start items-center space-x-2 w-full flex-wrap gap-4'>
                        {images.map((image: ProductImage) => (
                          <Card key={image.imgKey} className='relative overflow-hidden'>
                            <Image
                              src={image.imgUrl}
                              alt='product image'
                              className='w-36 h-36 object-cover object-center rounded-sm'
                              width={100}
                              height={100}
                            />
                            <Button
                              variant={'destructive'}
                              className='absolute top-1 right-1 h-6 w-6 p-0 rounded-full'
                              type='button'
                              onClick={() => handleRemoveImage(image)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </Card>
                        ))}
                        <div className="flex flex-col items-center justify-center p-4">
                          <FormControl>
                            <UploadButton
                              endpoint='imageUploader'
                              onClientUploadComplete={(res: any[]) => {
                                const imgUploaded: ProductImage = {
                                  imgUrl: res[0].ufsUrl || res[0].url,
                                  imgKey: res[0].key
                                }
                                form.setValue('images', [...images, imgUploaded])
                              }}
                              onUploadError={(error: Error) => {
                              }}
                            />
                          </FormControl>
                          <p className="text-sm text-neutral-500 mt-2">{t('addImages')}</p>
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/${storeId}/products`)} className="w-full sm:w-auto h-10">
              {tCommon('cancel')}
            </Button>
            <Button
              type='submit'
              size='lg'
              disabled={form.formState.isSubmitting}
              className='bg-orange hover:bg-orange-dark text-white w-full sm:w-auto h-10'
            >
              {form.formState.isSubmitting ? t('submitting') : type === 'Create' ? t('addProduct') : t('updateProduct')}
            </Button>
          </div>
        </form>
        <BarcodeScannerDialog
          open={isScannerOpen}
          onOpenChange={setIsScannerOpen}
          onScan={(result) => {
            form.setValue('itemBarcode', result)
            setBarcodeScanned(true)
            showSuccess(t('barcodeScannedSuccessfully'))
          }}
        />
      </Form>
    </div >
  )
}

export default ProductForm