/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
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
import { Trash, PlusCircle, RefreshCw, ChevronLeft } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from 'next/link'

const productDefaultValues: IProductInput =
  process.env.NODE_ENV === 'development'
    ? {
      name: 'Sample Product',
      slug: 'sample-product',
      category: 'Materiales',
      sku: 'SAMPLE-SKU',
      images: [{ imgUrl: '/images/p11-1.jpg', imgKey: 'sample-key' }],
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
      isProductKg: false,
      productId: 0,
      tags: [],
      ratingDistribution: [],
      reviews: [],
      // New fields defaults
      store: '',
      warehouse: '',
      sellingType: 'Unit',
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
      isProductKg: false,
      productId: 0,
      tags: [],
      ratingDistribution: [],
      reviews: [],
      store: '',
      warehouse: '',
      sellingType: '',
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
    }

const ProductForm = ({
  type,
  product,
  productId,
  categories = [],
  brands = [],
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
  categories?: { _id: string; categoryName: string; categorySlug: string }[]
  brands?: { _id: string; name: string; slug: string }[]
}) => {
  const router = useRouter()


  const [subCategories, setSubCategories] = useState<{ name: string; slug: string }[]>([])


  const form = useForm<any>({
    resolver: type === 'Update' ? zodResolver(ProductUpdateSchema) : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  const { showSuccess, showError } = useToast()

  const selectedCategory = form.watch('category')
  const productName = form.watch('name')

  useEffect(() => {
    if (type === 'Create' && productName) {
      form.setValue('slug', toSlug(productName))
    }
  }, [productName, type, form])

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
        const isValid = subs.some(s => s.name === currentSub)
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

  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createProduct(values)
      if (!res.success) {
        showError(res.message)
      } else {
        showSuccess(res.message)
        router.push(`/admin/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/products`)
        return
      }
      const res = await updateProduct({ ...values, _id: productId })
      if (!res.success) {
        showError(res.message)
      } else {
        showSuccess(res.message)
        router.push(`/admin/products`)
      }
    }
  }
  const images = form.watch('images')

  const handleRemoveImage = async (image: ProductImage) => {
    if (!productId) {
      showError('Product ID is required to delete images')
      return
    }
    const res = await deleteProductImg(productId, image.imgKey)
    if (res.success) {
      showSuccess('Image deleted successfully')
      form.setValue('images', images.filter((img) => img.imgKey !== image.imgKey))
    } else {
      showError(res.errorMessage || 'Failed to delete image')
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{type} Product</h1>
          <p className="text-muted-foreground">Create new product</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/admin/products">
            <Button className="bg-navy hover:bg-navy/90 text-white">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Product
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          method='post'
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            showError('Please check the form for errors. Required fields are marked with *.')
            console.log(errors)
          })}
          className='space-y-8'
        >
          {/* Product Information Section */}
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <span className="text-orange">ⓘ</span> Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='store'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="store1">Main Store</SelectItem>
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
                      <FormLabel>Warehouse <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="warehouse1">Main Warehouse</SelectItem>
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
                      <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder='Enter product name' {...field} />
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
                      <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input placeholder='Enter product slug' {...field} disabled />
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
                      <FormLabel>SKU <span className="text-red-500">*</span></FormLabel>
                      <div className="flex gap-2">
                        <div className="w-full flex-1">
                          <FormControl>
                            <Input placeholder='Enter SKU' {...field} />
                          </FormControl>
                        </div>
                        <Button type="button" className="bg-orange hover:bg-orange-dark text-white">Generate</Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='sellingType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Type <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Unit">Unit</SelectItem>
                          <SelectItem value="Weight">Weight</SelectItem>
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
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
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
                                <SelectValue placeholder="Select" />
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
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" className="text-orange hover:text-orange-dark whitespace-nowrap px-2">
                          <PlusCircle className="w-4 h-4 mr-1" /> Add New
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
                      <FormLabel>Sub Category <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
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
                      <FormLabel>Brand <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                            <SelectItem value="Generico">Generico</SelectItem>
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
                      <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Piece">Piece</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="M3">M3</SelectItem>
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
                      <FormLabel>Barcode Symbology <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                      <FormLabel>Item Barcode <span className="text-red-500">*</span></FormLabel>
                      <div className="flex gap-2">
                        <div className="w-full flex-1">
                          <FormControl>
                            <Input placeholder='Enter Barcode' {...field} />
                          </FormControl>
                        </div>
                        <Button type="button" className="bg-orange hover:bg-orange-dark text-white">Generate</Button>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter product description'
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
                <span className="text-orange">ⓘ</span> Pricing & Stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name='productType'
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Product Type <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="Single Product" id="single" className="text-orange border-orange" />
                          <FormLabel htmlFor="single" className="font-normal">Single Product</FormLabel>
                          <RadioGroupItem value="Variable Product" id="variable" className="text-orange border-orange ml-4" />
                          <FormLabel htmlFor="variable" className="font-normal">Variable Product</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <FormField
                  control={form.control}
                  name='countInStock'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter quantity' {...field} />
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
                      <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter price' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='taxType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Type <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Exclusive">Exclusive</SelectItem>
                          <SelectItem value="Inclusive">Inclusive</SelectItem>
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
                      <FormLabel>Tax <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                      <FormLabel>Discount Type <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="Fixed">Fixed</SelectItem>
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
                      <FormLabel>Discount Value <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter discount' {...field} />
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
                      <FormLabel>Quantity Alert <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter quantity alert' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <span className="text-orange">📷</span> Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='images'
                render={() => (
                  <FormItem className='w-full'>
                    <FormLabel>Images</FormLabel>
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
                          <p className="text-sm text-neutral-500 mt-2">Add Images</p>
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
            <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
              Cancel
            </Button>
            <Button
              type='submit'
              size='lg'
              disabled={form.formState.isSubmitting}
              className='bg-orange hover:bg-orange-dark text-white'
            >
              {form.formState.isSubmitting ? 'Submitting...' : type === 'Create' ? 'Add Product' : 'Update Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ProductForm