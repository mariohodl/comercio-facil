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
import { SignOut } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import { ChevronDown, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default async function UserButton() {
  const session = await auth()
  const t = await getTranslations()
  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 px-2 hover:bg-gray-100 transition-colors rounded-full">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
              {session ? session.user.name?.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex md:flex-col text-left pl-1 gap-0.5">
              <span className="text-[11px] text-gray-500 leading-tight whitespace-nowrap">{t('header.hello', { name: session?.user?.name ? session.user.name.split(' ')[0] : t('common.signIn') })}</span>
              <span className="text-sm font-bold leading-tight whitespace-nowrap">{t('header.account')}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
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

              {(session.user.role === 'Seller' || session.user.role === 'Admin') && session.user.storeId && (
                <Link className='w-full' href={`/admin/pos/${session.user.storeId}`}>
                  <DropdownMenuItem>{t('common.goToPOS')}</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className='p-0 mb-1'>
              <form action={SignOut} className='w-full'>
                <Button
                  className='w-full py-4 px-2 h-4 justify-start'
                  variant='ghost'
                >
                  {t('common.signOut')}
                </Button>
              </form>
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