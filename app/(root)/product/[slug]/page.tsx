import { Card, CardContent } from '@/components/ui/card'
import AddToCart from '@/components/shared/product/add-to-cart'
import { generateId, round2 } from '@/lib/utils'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'

// import SelectVariant from '@/components/shared/product/select-variant'
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

  const { page } = searchParams

  const params = await props.params

  const { slug } = params

  const product = await getProductBySlug(slug)

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(page || '1'),
  })

  const session = await auth()

  return (
    <div className="container mx-auto py-8">
      <AddToBrowsingHistory id={product._id} category={product.category} />
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div className='col-span-2'>
            <ProductGallery images={product.images} />
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
                    price={product.price}
                    listPrice={product.listPrice}
                    isDeal={product.tags.includes('todays-deal')}
                    forListing={false}
                    className="text-orange"
                  />
                </div>
              </div>
            </div>
            {/* <div>
              <SelectVariant
                product={product}
                size={size || product.sizes[0]}
                color={color || product.colors[0]}
              />
            </div> */}
            <Separator className='my-4 bg-neutral-200' />
            <div className='flex flex-col gap-3'>
              <p className='font-bold text-xl text-navy'>Descripción</p>
              <p className='text-neutral-600 leading-relaxed'>
                {product.description}
              </p>
            </div>
          </div>
          <div>
            <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden">
              <CardContent className='p-6 flex flex-col gap-6'>
                <div className="flex flex-col gap-2">
                  <ProductPrice price={product.price} className="text-3xl font-bold text-navy" />
                  {product.listPrice > product.price && (
                    <div className="text-sm text-neutral-500">
                      Precio de lista: <span className="line-through">${product.listPrice}</span>
                    </div>
                  )}
                </div>

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className='text-orange font-bold text-sm bg-orange-50 p-2 rounded'>
                    {`¡Solo quedan ${product.countInStock} en existencia!`}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {product.countInStock !== 0 ? (
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

                {product.countInStock !== 0 && (
                  <div className='flex justify-center items-center w-full'>
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product._id,
                        countInStock: product.countInStock,
                        name: product.name,
                        slug: product.slug,
                        category: product.category,
                        sku: product.sku,
                        price: round2(product.price),
                        quantity: 1,
                        image: product.images?.[0]?.imgUrl || `/images/${product.category.toLocaleLowerCase()}-category-product.jpg`,
                        // size: size || product.sizes[0],
                        // color: color || product.colors[0],
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