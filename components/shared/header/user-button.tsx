import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutButton } from '../auth/sign-out-button'
import { cn } from '@/lib/utils'
import { ChevronDown, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default async function UserButton({
  variant = 'light',
  showNav = true
}: {
  variant?: 'light' | 'dark',
  showNav?: boolean
}) {
  const session = await auth()
  const t = await getTranslations()
  return (
    <div className='flex mdgap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 h-auto py-1.5 px-3 transition-all rounded-full active:scale-95",
              variant === 'dark'
                ? "text-white hover:bg-gray-800"
                : "hover:bg-gray-100"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-inner",
              variant === 'dark'
                ? "bg-gray-800 text-orange border border-gray-700"
                : "bg-blue-100 text-blue-600"
            )}>
              {session ? session.user.name?.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex md:flex-col text-left gap-0">
              <span className={cn(
                "text-[10px] uppercase font-bold tracking-wider leading-none",
                variant === 'dark' ? "text-gray-500" : "text-gray-400"
              )}>
                {t('header.hello', { name: '' }).split(',')[0]}
              </span>
              <span className="text-sm font-bold leading-tight whitespace-nowrap">
                {session?.user?.name ? session.user.name.split(' ')[0] : t('common.signIn')}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        {session ? (
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {session.user.name}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            {showNav && (
              <DropdownMenuGroup>
                <Link className='w-full' href='/account'>
                  <DropdownMenuItem>{t('common.myAccount')}</DropdownMenuItem>
                </Link>
                <Link className='w-full' href='/account/orders'>
                  <DropdownMenuItem>{t('common.myOrders')}</DropdownMenuItem>
                </Link>

                {session.user.role === 'Admin' && (
                  <Link className='w-full' href={`/admin/${session?.user.storeId}/overview`}>
                    <DropdownMenuItem>Admin</DropdownMenuItem>
                  </Link>
                )}

                {session.user.role === 'SuperAdmin' && (
                  <Link className='w-full' href='/super-admin'>
                    <DropdownMenuItem>Super Admin</DropdownMenuItem>
                  </Link>
                )}

                {(session.user.role === 'Seller' || session.user.role === 'Admin') && session.user.storeId && (
                  <Link className='w-full' href={`/admin/pos/${session.user.storeId}`}>
                    <DropdownMenuItem>{t('common.goToPOS')}</DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuGroup>
            )}
            <DropdownMenuItem className='p-0 mb-1'>
              <SignOutButton
                variant="ghost"
                className="w-full py-4 px-2 h-4 justify-start font-normal"
                callbackUrl="/"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className={cn(buttonVariants(), 'w-full')}
                  href='/sign-in'
                >
                  {t('common.signIn')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className='font-normal'>
                {t('auth.noAccount')} <Link href='/sign-up'><span className='underline'>{t('common.signUp')}</span></Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  )
}