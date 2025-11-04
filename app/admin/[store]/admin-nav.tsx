'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CustomH4 } from '@/components/shared/CustomH4'
import { CustomP } from '@/components/shared/CustomP'
import React from 'react'
import { cn } from '@/lib/utils'

export function AdminNav({
  storeId,
}: {storeId: string, className?: string}) {
  const pathname = usePathname()
  const linksObj = {
    general: {
      dashboard: {
        title: 'Overview',
        href: `/admin/${storeId}/overview`,
        roles: ['Admin', 'Superadmin'],
        submenu:[]
      },
      superadmin: {
        title: 'Super Admin',
        href: `/admin/${storeId}/superadmin`,
        roles: ['Admin', 'Superadmin'],
        submenu:[]
      }
    },
    inventario: {
      productos:{
        title: 'productos',
        href: `/admin/${storeId}/products`,
        submenu:[]
      },
      crearProducto:{
        title: 'Crear Producto',
        href: `/admin/${storeId}/products/create`,
        submenu:[]
      }
    },
    existencias: {
      manejarStock:{
        title: 'Manejar existencias',
        href: `/admin/${storeId}/manejar-existencias`,
        submenu:[]
      }
    },
    ventas: {
      ventas:{
        title: 'Ventas',
        href: `xxxx`,
        submenu:[{
          title: 'Ventas en linea',
          href: ``,
        },
        {
          title: 'POS orders',
          href: ``,
        },
      ]
      }
    }
  }
  return (
    <nav className='fixed w-[240] h-screen  left-0 top-12 shadow-md scroll-m-2 p-4'>
      {Object.keys(linksObj).map((key, index) => (
        <div className='pb-2 my-5 border-b border-black-400 capitalize' key={index}>
          <CustomH4 classNames={""}>{key}</CustomH4>
          <CustomP classNames='ml-1 flex flex-col'>
            {Object.keys(linksObj[key]).map((keyChild, indexChild) => (
              <Link
              key={indexChild}
              href={linksObj[key][keyChild].href}
              className={cn(
                'p-1 mb-1 text-base rounded-sm transition-all hover:bg-slate-200',
                pathname.includes(linksObj[key][keyChild].href) ? 'underline bg-slate-200' : ''
              )}>
                {linksObj[key][keyChild].title}
              </Link>
            ))}
          </CustomP>
        </div>
      ))}
    </nav>
  )
}