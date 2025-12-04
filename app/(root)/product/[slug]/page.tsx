import { Card, CardContent } from '@/components/ui/card'
import AddToCart from '@/components/shared/product/add-to-cart'
import { generateId, round2 } from '@/lib/utils'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'

import SelectVariant from '@/components/shared/product/select-variant'
import ProductPrice from '@/components/shared/product/product-price'
import ProductGallery from '@/components/shared/product/product-gallery'
import { Separator } from '@/components/ui/separator'
import ProductSlider from '@/components/shared/product/product-slider'
import RatingSummary from '@/components/shared/product/rating-summary'
import ReviewList from './review-list'
import { auth } from '@/auth'
import BrowsingHistoryList from '../../../../components/shared/browsing-history-list';
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await getProductBySlug(params.slug)
  if (!product) {
    return { title: 'Product not found' }
  }
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string; color: string; size: string }>
}) {
  const searchParams = await props.searchParams

  const params = await props.params

  const { slug } = params

  const product = await getProductBySlug(slug)

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(searchParams.page || '1'),
  })

  const session = await auth()

  // Logic to determine the selected variant
  let selectedVariant: any = null
  if (product.variants && product.variants.length > 0) {
    selectedVariant = product.variants.find((v: any) => {
      // Check if every attribute in the variant matches the selected searchParams
      return v.attributes.every((a: any) => {
        const paramValue = searchParams[a.name.toLowerCase()]
        return paramValue === a.value
      })
    })

    // If no variant selected, and no params are set, default to the first one
    const hasSelectedAttributes = product.attributes && product.attributes.some((attr: any) => searchParams[attr.name.toLowerCase()])
    if (!selectedVariant && !hasSelectedAttributes) {
      selectedVariant = product.variants[0]
    }
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const currentListPrice = selectedVariant ? selectedVariant.listPrice : product.listPrice
  const currentStock = selectedVariant ? selectedVariant.countInStock : product.countInStock
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku


  return (
    <div className="container mx-auto py-8">
      <AddToBrowsingHistory id={product._id} category={product.category} />
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div className='col-span-2'>
            <ProductGallery images={selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images : product.images} />
          </div>

          <div className='flex w-full flex-col gap-4 col-span-2'>
            <div className='flex flex-col gap-4'>
              <div className="flex items-center gap-2">
                <span className='px-3 py-1 rounded-full bg-neutral-100 text-navy text-sm font-medium'>
                  {product.category}
                </span>
                <span className="text-neutral-400">|</span>
                <span className='text-neutral-600 text-sm'>
                  Marca: <span className="font-medium text-navy">{product.brand}</span>
                </span>
              </div>

              <h1 className='font-bold text-3xl text-navy'>
                {product.name}
              </h1>

              <div className="flex items-center gap-2">
                <RatingSummary
                  avgRating={product.avgRating}
                  numReviews={product.numReviews}
                  asPopover
                  ratingDistribution={product.ratingDistribution}
                />
              </div>

              <Separator className="bg-neutral-200" />

              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <div className='flex gap-3'>
                  <ProductPrice
                    price={currentPrice}
                    listPrice={currentListPrice}
                    isDeal={product.tags.includes('todays-deal')}
                    forListing={false}
                    className="text-orange"
                    unit={product.unit}
                  />
                </div>
              </div>
            </div>
            <div>
              <SelectVariant
                product={product}
              />
            </div>
            <Separator className='my-4 bg-neutral-200' />
            <div className='flex flex-col gap-3'>
              <p className='font-bold text-xl text-navy'>Descripción</p>
              <p className='text-neutral-600 leading-relaxed'>
                {product.description}
              </p>
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <>
                <Separator className='my-4 bg-neutral-200' />
                <div className='flex flex-col gap-3'>
                  <p className='font-bold text-xl text-navy'>Especificaciones</p>
                  <div className="grid grid-cols-1 gap-2">
                    {product.attributes.map((attr: any) => (
                      <div key={attr.name} className="grid grid-cols-2 gap-4 border-b border-neutral-100 py-2 last:border-0">
                        <span className="font-medium text-neutral-700">{attr.name}</span>
                        <span className="text-neutral-600">{attr.values.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div>
            <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden">
              <CardContent className='p-6 flex flex-col gap-6'>
                <div className="flex flex-col gap-2">
                  <ProductPrice price={currentPrice} className="text-3xl font-bold text-navy" unit={product.unit} />
                  {currentListPrice > currentPrice && (
                    <div className="text-sm text-neutral-500">
                      Precio de lista: <span className="line-through">${currentListPrice}</span>
                    </div>
                  )}
                </div>

                {currentStock > 0 && currentStock <= 3 && (
                  <div className='text-orange font-bold text-sm bg-orange-50 p-2 rounded'>
                    {`¡Solo quedan ${currentStock} en existencia!`}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {currentStock !== 0 ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className='text-green-700 font-medium'>En existencia</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className='text-destructive font-medium'>No disponible</span>
                    </>
                  )}
                </div>

                {currentStock !== 0 && (
                  <div className='flex justify-center items-center w-full'>
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product._id,
                        countInStock: currentStock,
                        name: product.name,
                        slug: product.slug,
                        category: product.category,
                        sku: currentSku,
                        price: round2(currentPrice),
                        quantity: 1,
                        image: product.images?.[0]?.imgUrl || `/images/${product.category.toLocaleLowerCase()}-category-product.jpg`,
                        // Pass selected attributes as separate props if needed, or update AddToCart to accept them differently
                        // For now, let's pass them as 'color' and 'size' if they exist, or maybe we need a generic 'attributes' prop in AddToCart?
                        // The CartItem schema has color and size optional. 
                        // Let's try to map them if possible, or just leave them empty for now if not color/size.
                        // Actually, we should probably update AddToCart/CartItem to support generic attributes, but that's out of scope.
                        // For now, let's map 'Color' and 'Size' / 'Talla' if they exist.
                        size: searchParams['size'] || searchParams['talla'] || '',
                        color: searchParams['color'] || '',
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      <section className='mt-16'>
        <h2 className='font-bold text-2xl text-navy mb-6' id='reviews'>
          Opiniones de Clientes
        </h2>
        <ReviewList product={product} userId={session?.user.id} />
      </section>

      <section className='mt-16'>
        <ProductSlider
          products={relatedProducts.data}
          title={`Los más vendidos en ${product.category}`}
        />
      </section>
      <section>
        <BrowsingHistoryList className='mt-16' />
      </section>
    </div>
  )
}