// import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
// import ProductSlider from '@/components/shared/product/product-slider'
import { getAllCategories, getProductsForCard, getProductsByTag } from '@/lib/actions/product.actions'
import { toSlug } from '@/lib/utils'
import data from '@/lib/data'
import { WhatWeOffer } from '@/components/shared/home/what-we-offer'
import { WidgetVideo } from '@/components/shared/home/widget-video'
import { WhatWeDoCategories } from '@/components/shared/home/what-we-do-categories'
import { OurFreshProducts } from '@/components/shared/home/our-fresh-products'
import { HomeBanner } from '@/components/shared/home/home-banner'

// import { Card, CardContent } from '@/components/ui/card'
// import BrowsingHistoryList from '@/components/shared/browsing-history-list'

export default async function HomePage() {
  // const categories = (await getAllCategories()).slice(0, 4)
  // const newArrivals = await getProductsForCard({
  //   tag: 'new-arrival',
  //   limit: 4,
  // })
  // const featureds = await getProductsForCard({
  //   tag: 'featured',
  //   limit: 4,
  // })
  // const bestSellers = await getProductsForCard({
  //   tag: 'best-seller',
  //   limit: 4,
  // })
  // const cards = [
  //   {
  //     title: 'Categorías para explorar',
  //     link: {
  //       text: 'Ver más',
  //       href: '/search',
  //     },
  //     items: categories.map((category) => ({
  //       name: category,
  //       image: `/images/${toSlug(category)}-category-product.jpg`,
  //       href: `/search?category=${category}`,
  //     })),
  //   },
  //   {
  //     title: 'Explora Nuevos productos',
  //     items: newArrivals,
  //     link: {
  //       text: 'Ver todos',
  //       href: '/search?tag=new-arrival',
  //     },
  //   },
  //   {
  //     title: 'Descubre los más vendidos',
  //     items: bestSellers,
  //     link: {
  //       text: 'Ver todos',
  //       href: '/search?tag=new-arrival',
  //     },
  //   },
  //   {
  //     title: 'Productos destacados',
  //     items: featureds,
  //     link: {
  //       text: 'Comprar ahora',
  //       href: '/search?tag=new-arrival',
  //     },
  //   },
  // ]

  // const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })
  // const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })
  return (
    <>
      <HomeBanner />
      {/* <HomeCarousel items={data.carousels} /> */}
      {/* <div className='md:p-4 md:space-y-4 bg-border'>
        <HomeCard cards={cards} />
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider title={"Ofertas del Día"} products={todaysDeals} />
          </CardContent>
        </Card>
      </div>

      <div className='md:p-4 md:space-y-4 bg-border'>
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider title={"Productos más vendidos"} products={bestSellingProducts} hideDetails/>
          </CardContent>
        </Card>
      </div> */}
      {/* <div className='p-4 bg-background'>
        <BrowsingHistoryList />
      </div> */}

      <WhatWeOffer />
      <WhatWeDoCategories />
      <WidgetVideo />
      {/* <OurFreshProducts /> */}
      
    </>
  )
}