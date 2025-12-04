/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PlusCircle, ScanBarcode, Trash, RefreshCw, ChevronLeft, ChevronDown, X } from 'lucide-react'
import { useState, useEffect } from 'react'
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

const productDefaultValues: IProductInput =
  process.env.NODE_ENV === 'development'
    ? {
      name: 'Sample Product',
      slug: 'sample-product',
      category: 'Materiales',
      sku: 'SAMPLE-SKU',
      images: [],
      brand: 'Generico',
      description: 'This is a sample description of the product.',
      price: 99.99,
      listPrice: 0,
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
      // New fields defaults
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
    }
    : {
      name: '',
      slug: '',
      category: '',
      sku: '',
      images: [],
      brand: '',
      description: '',
      price: 0,
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
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
  storeId: string
  categories?: { _id: string; categoryName: string; categorySlug: string }[]
  brands?: { _id: string; name: string; slug: string }[]
  units?: { _id: string; name: string; abbreviation: string }[]
  attributes?: { _id: string; name: string; values: string[] }[]
}) => {
  const router = useRouter()
  const t = useTranslations('products')
  const tCommon = useTranslations('common')


  const [subCategories, setSubCategories] = useState<any[]>([])
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [barcodeScanned, setBarcodeScanned] = useState(false)

  // State for the new variant builder
  const [builderAttributes, setBuilderAttributes] = useState<Record<string, string[]>>({})
  const [newVariantData, setNewVariantData] = useState({
    price: 0,
    listPrice: 0,
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

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([])
        form.setValue('subCategory', '')
        return
      }

      const category = categories.find(c => c.categoryName === selectedCategory)
      if (category && category._id) {
        const subs = await getSubCategoriesByCategory(category._id)
        setSubCategories(subs)

        // Check if current subCategory is valid for the new category
        const currentSub = form.getValues('subCategory')
        const isValid = subs.some(s => s.name === currentSub) || currentSub === 'None'
        if (currentSub && !isValid) {
          form.setValue('subCategory', '')
        }
      } else {
        setSubCategories([])
        form.setValue('subCategory', '')
      }
    }

    fetchSubCategories()
  }, [selectedCategory, categories, form])

  // Watch pricing fields for automatic discount calculation
  const listPrice = form.watch('listPrice')
  const discountType = form.watch('discountType')
  const discountValue = form.watch('discountValue')

  useEffect(() => {
    const listPriceNum = Number(listPrice) || 0
    const discountValueNum = Number(discountValue) || 0

    let calculatedDiscountPrice = 0
    let calculatedSellingPrice = listPriceNum

    if (discountType && discountValueNum > 0) {
      if (discountType === 'Percentage') {
        calculatedDiscountPrice = listPriceNum - (listPriceNum * discountValueNum / 100)
      } else if (discountType === 'Fixed') {
        calculatedDiscountPrice = listPriceNum - discountValueNum
      }

      // Ensure discount price is not negative
      calculatedDiscountPrice = Math.max(0, calculatedDiscountPrice)
      calculatedSellingPrice = calculatedDiscountPrice
    }

    // Update the form values
    form.setValue('discountPrice', calculatedDiscountPrice)
    form.setValue('price', calculatedSellingPrice)
  }, [listPrice, discountType, discountValue, form])

  // Calculate variant selling price based on list price (currently no discounts for variants)
  useEffect(() => {
    setNewVariantData(prev => ({
      ...prev,
      price: prev.listPrice
    }))
  }, [newVariantData.listPrice])


  async function onSubmit(values: IProductInput) {
    let finalValues = { ...values }

    // If Variable Product, calculate aggregates from variants
    if (values.productType === 'Variable Product' && values.variants && values.variants.length > 0) {
      const totalStock = values.variants.reduce((acc: number, curr: any) => acc + (Number(curr.countInStock) || 0), 0)
      const minPrice = Math.min(...values.variants.map((v: any) => Number(v.price) || 0))
      const maxListPrice = Math.max(...values.variants.map((v: any) => Number(v.listPrice) || 0))
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
        price: minPrice,
        listPrice: maxListPrice,
        costPerUnit: maxCost,
        attributes: attributes,
        // Ensure discountPrice is also handled if needed, but for now let's leave it as is or set to 0
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{type === 'Create' ? t('createProduct') : t('updateProduct')}</h1>
          <p className="text-muted-foreground">{t('createNewProduct')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href={`/admin/${storeId}/products`}>
            <Button className="bg-navy hover:bg-navy/90 text-white">
              <ChevronLeft className="mr-2 h-4 w-4" /> {t('backToProduct')}
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          method='post'
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            showError(t('checkFormErrors'))
            console.log(errors)
          })}
          className='space-y-8'
        >
          {/* Product Information Section */}
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <span className="text-orange">ⓘ</span> {t('productInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='store'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('store')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="store1">{t('mainStore')}</SelectItem>
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
                      <FormLabel>{t('warehouse')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="warehouse1">{t('mainWarehouse')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('productName')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder={t('enterProductName')} {...field} />
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
                      <FormLabel>{t('slug')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input placeholder={t('enterProductSlug')} {...field} disabled />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='sku'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sku')} <span className="text-red-500">*</span></FormLabel>
                      <div className="flex gap-2">
                        <div className="w-full flex-1">
                          <FormControl>
                            <Input placeholder={t('enterBarcode')} {...field} />
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          className="bg-orange hover:bg-orange-dark text-white"
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


                      {/* Reactive SKU Generation */}
                    </FormItem>
                  )}
                />

              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category')} <span className="text-red-500">*</span></FormLabel>
                      <div className="flex gap-2 items-center">
                        <div className="w-full flex-1">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue('subCategory', '')
                              setSubCategories([])
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <SelectItem key={cat.categorySlug} value={cat.categoryName}>
                                    {cat.categoryName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-categories" disabled>
                                  {t('noCategoriesAvailable')}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" className="text-orange hover:text-orange-dark whitespace-nowrap px-2">
                          <PlusCircle className="w-4 h-4 mr-1" /> {t('addNew')}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='subCategory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('subCategory')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">{t('none')}</SelectItem>
                          {subCategories.map((sub) => (
                            <SelectItem key={sub.slug} value={sub.name}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='brand'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('brand')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.length > 0 ? (
                            brands.map((brand) => (
                              <SelectItem key={brand.slug} value={brand.name}>
                                {brand.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="Generico">{t('generic')}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='unit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('unit')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.length > 0 ? (
                            units.map((unit) => (
                              <SelectItem key={unit._id} value={unit.name}>
                                {unit.name} ({unit.abbreviation})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="Piece">{t('piece')}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='barcodeSymbology'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('barcodeSymbology')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                <FormField
                  control={form.control}
                  name='itemBarcode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('itemBarcode')} <span className="text-red-500">*</span></FormLabel>
                      <div className="flex gap-2">
                        <div className="w-full flex-1">
                          <FormControl>
                            <Input
                              placeholder={t('enterBarcode')}
                              {...field}
                              readOnly={barcodeScanned}
                              className={barcodeScanned ? 'bg-muted cursor-not-allowed' : ''}
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
                        >
                          <ScanBarcode className="h-4 w-4" />
                        </Button>
                        {barcodeScanned ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.setValue('itemBarcode', '')
                              setBarcodeScanned(false)
                            }}
                            title={t('clearScannedBarcode')}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            {t('clear')}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            className="bg-orange hover:bg-orange-dark text-white"
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
            <CardContent className="space-y-6">
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
                <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                  <h3 className="font-medium text-navy">{t('variantAttributes')}</h3>
                  {attributes && attributes.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-4 p-4 border rounded-md bg-gray-50">
                        <h3 className="font-medium">{t('addVariant')}</h3>

                        {/* Attribute Selection in Builder */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                          {attributes.map((attr) => (
                            <div key={attr._id} className="space-y-2">
                              <label className="text-sm font-medium">{attr.name}</label>
                              <Select
                                value={builderAttributes[attr.name]?.[0] || ''}
                                onValueChange={(value) => {
                                  if (value === '__clear__') {
                                    // Remove this attribute from builderAttributes
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
                                <SelectTrigger className={builderAttributes[attr.name]?.[0] ? 'bg-white border-yellow-500 border-2' : ''}>
                                  <SelectValue placeholder={t('select')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__clear__">
                                    <span className="text-muted-foreground italic">{t('select')}</span>
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

                        {/* Variant Details Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t('quantity')} <span className="text-red-500">*</span></label>
                            <Input
                              type="number"
                              value={newVariantData.countInStock}
                              onChange={(e) => setNewVariantData(prev => ({ ...prev, countInStock: Number(e.target.value) }))}
                              placeholder={t('enterQuantity')}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t('costPerUnit')} <span className="text-red-500">*</span></label>
                            <Input
                              type="number"
                              value={newVariantData.costPerUnit}
                              onChange={(e) => setNewVariantData(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                              placeholder={t('enterCost')}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t('listPrice')} <span className="text-red-500">*</span></label>
                            <Input
                              type="number"
                              value={newVariantData.listPrice}
                              onChange={(e) => setNewVariantData(prev => ({ ...prev, listPrice: Number(e.target.value) }))}
                              placeholder={t('enterListPrice')}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t('sellingPrice')}</label>
                            <Input
                              type="number"
                              value={newVariantData.price}
                              readOnly
                              className="bg-gray-100 cursor-not-allowed"
                              placeholder={t('calculatedPrice')}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t('taxType')} <span className="text-red-500">*</span></label>
                            <Select
                              value={newVariantData.taxType}
                              onValueChange={(value) => setNewVariantData(prev => ({ ...prev, taxType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('select')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Exclusive">{t('exclusive')}</SelectItem>
                                <SelectItem value="Inclusive">{t('inclusive')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('sku')} <span className="text-red-500">*</span></label>
                          <div className="flex gap-2">
                            <Input
                              value={newVariantData.sku}
                              readOnly
                              className="bg-gray-100"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const namePart = productName ? productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(6, 'X') : 'PROD'
                                const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase().padEnd(8, 'X') : 'STOREID'
                                const mainSku = form.getValues('sku') || 'SKU'
                                const mainSkuLast5 = mainSku.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase().padStart(5, '0')
                                const randomSuffix = Math.floor(1000 + Math.random() * 9000)
                                const generatedSku = `${namePart}-${storePart}-${mainSkuLast5}-${randomSuffix}`
                                setNewVariantData(prev => ({ ...prev, sku: generatedSku }))
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-sm font-medium">{t('barcode')} <span className="text-red-500">*</span></label>
                          <div className="flex gap-2">
                            <Input
                              value={newVariantData.barcode}
                              onChange={(e) => setNewVariantData(prev => ({ ...prev, barcode: e.target.value }))}
                              placeholder={t('enterBarcode')}
                              className={`flex-1 ${newVariantData.barcode ? 'bg-gray-100' : ''}`}
                              readOnly={!!newVariantData.barcode}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setIsScannerOpen(true)}
                            >
                              <ScanBarcode className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              className="bg-orange text-white hover:bg-orange/90"
                              onClick={() => {
                                const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString()
                                setNewVariantData(prev => ({ ...prev, barcode: randomBarcode }))
                              }}
                            >
                              {t('generate')}
                            </Button>
                          </div>
                        </div>

                        {/* Variant Images Upload */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('variantImages')} (Max 2) <span className="text-red-500">*</span></label>
                          <div className="space-y-2">
                            {newVariantData.images.length < 2 && (
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
                                className="ut-button:bg-orange ut-button:ut-readying:bg-orange/50"
                              />
                            )}
                            {newVariantData.images.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {newVariantData.images.map((image, idx) => (
                                  <div key={idx} className="relative w-20 h-20 border rounded">
                                    <Image
                                      src={image.imgUrl}
                                      alt={`Variant image ${idx + 1}`}
                                      fill
                                      className="object-cover rounded"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                      onClick={() => {
                                        setNewVariantData(prev => ({
                                          ...prev,
                                          images: prev.images.filter((_, i) => i !== idx)
                                        }))
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
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
                            sku: newVariantData.sku,
                            barcode: newVariantData.barcode,
                            taxType: newVariantData.taxType,
                            tax: newVariantData.tax,
                            images: newVariantData.images
                          }

                          const currentVariants = form.getValues('variants') || []
                          form.setValue('variants', [...currentVariants, newVariant])

                          // Regenerate SKU for next variant
                          const namePart = productName ? productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase().padEnd(6, 'X') : 'PROD'
                          const storePart = storeId ? storeId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase().padEnd(8, 'X') : 'STOREID'
                          const mainSku = form.getValues('sku') || 'SKU'
                          const mainSkuLast5 = mainSku.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase().padStart(5, '0')
                          const randomSuffix = Math.floor(1000 + Math.random() * 9000)
                          const generatedSku = `${namePart}-${storePart}-${mainSkuLast5}-${randomSuffix}`

                          setNewVariantData(prev => ({
                            ...prev,
                            sku: generatedSku,
                            barcode: '', // Reset barcode
                            images: [] // Reset images
                          }))
                        }}
                        className="w-full md:w-auto self-end"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('addVariant')}
                      </Button>
                    </div>

                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('noAttributesFound')} <Link href={`/admin/${storeId}/inventory/attributes`} className="text-orange hover:underline">{t('createAttributes')}</Link>
                    </p>
                  )}
                </div>
              )}

              {/* Generated Variants Table */}
              {form.watch('productType') === 'Variable Product' && (
                <div className="space-y-4 border p-4 rounded-md bg-gray-50 mt-4">
                  <h3 className="font-medium text-navy">{t('generatedVariants')}</h3>
                  {form.watch('variants') && form.watch('variants').length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr>
                            <th className="px-4 py-2">{t('variant')}</th>
                            <th className="px-4 py-2">{t('images')}</th>
                            <th className="px-4 py-2">{t('sku')}</th>
                            <th className="px-4 py-2">{t('barcode')}</th>
                            <th className="px-4 py-2">{t('cost')}</th>
                            <th className="px-4 py-2">{t('price')}</th>
                            <th className="px-4 py-2">{t('stock')}</th>
                            <th className="px-4 py-2">{t('actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(form.watch('variants') || []).map((variant: any, index: number) => {
                            return (
                              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">
                                  <div className="flex flex-col gap-1">
                                    {variant.attributes.map((variantAttr: any, attrIndex: number) => (
                                      <div key={attrIndex} className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground w-16">{variantAttr.name}:</span>
                                        <span className="font-medium">{variantAttr.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  {variant.images && variant.images.length > 0 ? (
                                    <div className="flex gap-1">
                                      {variant.images.map((img: ProductImage, imgIdx: number) => (
                                        <div key={imgIdx} className="relative w-10 h-10 border rounded">
                                          <Image
                                            src={img.imgUrl}
                                            alt={`Variant ${index + 1} image ${imgIdx + 1}`}
                                            fill
                                            className="object-cover rounded"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm">{variant.sku}</td>
                                <td className="px-4 py-2 text-sm">{variant.barcode || '-'}</td>
                                <td className="px-4 py-2 text-sm">${variant.costPerUnit}</td>
                                <td className="px-4 py-2 text-sm">${variant.price}</td>
                                <td className="px-4 py-2 text-sm">{variant.countInStock}</td>
                                <td className="px-4 py-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                    onClick={() => {
                                      const newVariants = [...(form.getValues('variants') || [])]
                                      newVariants.splice(index, 1)
                                      form.setValue('variants', newVariants)
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {form.watch('productType') === 'Single Product' && (
                  <>
                    <FormField
                      control={form.control}
                      name='countInStock'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quantity')} <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type='number' placeholder={t('enterQuantity')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name='costPerUnit'
                  render={({ field }) => (
                    <FormItem className={form.watch('productType') === 'Variable Product' ? 'hidden' : ''}>
                      <FormLabel>{t('costPerUnit')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' placeholder={t('enterCost')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch('productType') === 'Single Product' && (
                  <>
                    <FormField
                      control={form.control}
                      name='listPrice'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('listPrice')} <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type='number' step='0.01' placeholder={t('enterListPrice')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('sellingPrice')} <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              step='0.01'
                              placeholder={t('calculatedPrice')}
                              {...field}
                              disabled
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name='taxType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('taxType')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <FormField
                  control={form.control}
                  name='tax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tax')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
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
                <FormField
                  control={form.control}
                  name='discountType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('discountType')} <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>{t('discountValue')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' placeholder={t('enterDiscount')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <FormField
                  control={form.control}
                  name='quantityAlert'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('quantityAlert')} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' placeholder={t('enterQuantityAlert')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='isPublished'
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0">
                      <FormLabel className="text-sm font-medium">{t('published')}</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        {t('makeProductVisible')}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
                                console.log('resIMG', res)
                                const imgUploaded: ProductImage = {
                                  imgUrl: res[0].ufsUrl || res[0].url,
                                  imgKey: res[0].key
                                }
                                form.setValue('images', [...images, imgUploaded])
                              }}
                              onUploadError={(error: Error) => {
                                console.log(error)
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

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/${storeId}/products`)}>
              {tCommon('cancel')}
            </Button>
            <Button
              type='submit'
              size='lg'
              disabled={form.formState.isSubmitting}
              className='bg-orange hover:bg-orange-dark text-white'
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