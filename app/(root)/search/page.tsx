import Link from 'next/link'

import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import {
  getAllCategories,
  getAllProducts,
  getAllTags,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import { getFilterUrl, toSlug } from '@/lib/utils'
import Rating from '@/components/shared/product/rating'

import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile'

const sortOrders = [
  { value: 'price-low-to-high', name: 'Precio: de menor a mayor' },
  { value: 'price-high-to-low', name: 'Precio: de mayor a menor' },
  { value: 'newest-arrivals', name: 'Recien agregado' },
  { value: 'avg-customer-review', name: 'Promedio de opinion del cliente' },
  { value: 'best-selling', name: 'los más vendido' },
]

const prices = [
  {
    name: '$1 to $20',
    value: '1-20',
  },
  {
    name: '$21 to $50',
    value: '21-50',
  },
  {
    name: '$51 to $1000',
    value: '51-1000',
  },
]

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
  } = searchParams

  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    tag !== 'all' ||
    rating !== 'all' ||
    price !== 'all'
  ) {
    return {
      title: `Search ${q !== 'all' ? q : ''}
          ${category !== 'all' ? ` : Category ${category}` : ''}
          ${tag !== 'all' ? ` : Tag ${tag}` : ''}
          ${price !== 'all' ? ` : Price ${price}` : ''}
          ${rating !== 'all' ? ` : Rating ${rating}` : ''}`,
    }
  } else {
    return {
      title: 'Search Products',
    }
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams

  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams

  const params = { q, category, tag, price, rating, sort, page }

  const categories = await getAllCategories()
  const tags = await getAllTags()
  const data = await getAllProducts({
    category,
    tag,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
  })
  return (
    <div className="container mx-auto">
      <div className='mb-6 bg-white p-4 rounded-lg shadow-sm border border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className='flex items-center flex-wrap gap-2 text-navy'>
          <span className="font-medium">
            {data.totalProducts === 0
              ? 'No'
              : `${data.from}-${data.to} of ${data.totalProducts}`}
          </span>
          <span>resultados</span>
          {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            (tag !== 'all' && tag !== '') ||
            rating !== 'all' ||
            price !== 'all'
            ? <span className="text-neutral-400">|</span>
            : null}

          {q !== 'all' && q !== '' && (
            <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-sm">
              "{q}"
            </span>
          )}
          {category !== 'all' && category !== '' && (
            <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-sm">
              Categoría: {category}
            </span>
          )}
          {tag !== 'all' && tag !== '' && (
            <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-sm">
              Tag: {tag}
            </span>
          )}
          {price !== 'all' && (
            <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-sm">
              Precio: {price}
            </span>
          )}
          {rating !== 'all' && (
            <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-sm">
              Opiniones: {rating} o más
            </span>
          )}

          {(q !== 'all' && q !== '') ||
            (category !== 'all' && category !== '') ||
            (tag !== 'all' && tag !== '') ||
            rating !== 'all' ||
            price !== 'all' ? (
            <Button variant={'link'} asChild className="text-orange hover:text-orange-dark p-0 h-auto ml-2">
              <Link href='/search'>Limpiar Filtros</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>
      <div className='grid md:grid-cols-5 md:gap-8'>
        <CollapsibleOnMobile title='Filtros'>
          <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm border border-neutral-200'>
            <div>
              <div className='font-bold text-navy text-lg mb-3'>Departamento</div>
              <ul className="space-y-2">
                <li>
                  <Link
                    className={`block px-2 py-1 rounded transition-colors ${('all' === category || '' === category)
                      ? 'bg-orange-50 text-orange font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                      }`}
                    href={getFilterUrl({ category: 'all', params })}
                  >
                    Todo
                  </Link>
                </li>
                {categories.map((c: string) => (
                  <li key={c}>
                    <Link
                      className={`block px-2 py-1 rounded transition-colors ${c === category
                        ? 'bg-orange-50 text-orange font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                        }`}
                      href={getFilterUrl({ category: c, params })}
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-px bg-neutral-200 my-4"></div>
            <div>
              <div className='font-bold text-navy text-lg mb-3'>Precio</div>
              <ul className="space-y-2">
                <li>
                  <Link
                    className={`block px-2 py-1 rounded transition-colors ${'all' === price
                      ? 'bg-orange-50 text-orange font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                      }`}
                    href={getFilterUrl({ price: 'all', params })}
                  >
                    Todo
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link
                      href={getFilterUrl({ price: p.value, params })}
                      className={`block px-2 py-1 rounded transition-colors ${p.value === price
                        ? 'bg-orange-50 text-orange font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                        }`}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-px bg-neutral-200 my-4"></div>
            <div>
              <div className='font-bold text-navy text-lg mb-3'>Opiniones</div>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={getFilterUrl({ rating: 'all', params })}
                    className={`block px-2 py-1 rounded transition-colors ${'all' === rating
                      ? 'bg-orange-50 text-orange font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                      }`}
                  >
                    Todo
                  </Link>
                </li>

                <li>
                  <Link
                    href={getFilterUrl({ rating: '4', params })}
                    className={`block px-2 py-1 rounded transition-colors ${'4' === rating
                      ? 'bg-orange-50 text-orange font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                      }`}
                  >
                    <div className='flex items-center'>
                      <Rating size={4} rating={4} /> &nbsp; o más
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="h-px bg-neutral-200 my-4"></div>
            <div>
              <div className='font-bold text-navy text-lg mb-3'>Etiquetas</div>
              <ul className="space-y-2">
                <li>
                  <Link
                    className={`block px-2 py-1 rounded transition-colors ${('all' === tag || '' === tag)
                      ? 'bg-orange-50 text-orange font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                      }`}
                    href={getFilterUrl({ tag: 'all', params })}
                  >
                    Todo
                  </Link>
                </li>
                {tags.map((t: string) => (
                  <li key={t}>
                    <Link
                      className={`block px-2 py-1 rounded transition-colors ${toSlug(t) === tag
                        ? 'bg-orange-50 text-orange font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy'
                        }`}
                      href={getFilterUrl({ tag: t, params })}
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleOnMobile>

        <div className='md:col-span-4 space-y-6'>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <div className='font-bold text-2xl text-navy mb-2'>Resultados</div>
            <div className="text-neutral-500">Busca en cada página otras opciones de producto.</div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {data.products.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-neutral-200">
                <p className="text-neutral-500 text-lg">No se encontraron productos</p>
              </div>
            )}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={page} totalPages={data.totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}