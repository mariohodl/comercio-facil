'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface SignOutButtonProps {
    className?: string
    variant?: 'ghost' | 'outline' | 'default' | 'destructive'
    callbackUrl?: string
    showIcon?: boolean
}

export function SignOutButton({
    className,
    variant = 'ghost',
    callbackUrl = '/',
    showIcon = false
}: SignOutButtonProps) {
    const t = useTranslations('common')

    const handleSignOut = async () => {
        try {
            if (!navigator.onLine) {
                // If offline, we can't reach the server to destroy the session
                // but we can force redirect the user to the home or sign-in page
                // so they "feel" logged out. 
                window.location.href = callbackUrl
                return
            }

            await signOut({ callbackUrl })
        } catch (error) {
            console.error('Logout error:', error)
            // Fallback for any error (like unexpected network issues)
            window.location.href = callbackUrl
        }
    }

    return (
        <Button
            onClick={handleSignOut}
            className={cn('w-full flex items-center justify-start gap-2', className)}
            variant={variant}
        >
            {showIcon && <LogOut className="w-4 h-4" />}
            {t('signOut')}
        </Button>
    )
}
