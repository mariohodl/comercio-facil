'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type Locale = 'es' | 'en'

const languages = {
    es: { name: 'Español', flag: '🇲🇽' },
    en: { name: 'English', flag: '🇺🇸' },
}

export function LanguageSwitcher() {
    const [isPending, startTransition] = useTransition()
    const locale = useLocale() as Locale

    const switchLanguage = (newLocale: Locale) => {
        startTransition(() => {
            // Set cookie with new locale
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000` // 1 year
            // Reload page to apply new locale
            window.location.reload()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    disabled={isPending}
                >
                    <Globe className="h-4 w-4" />
                    <span className="hidden md:inline">{languages[locale].name}</span>
                    <span className="text-lg">{languages[locale].flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.entries(languages).map(([code, { name, flag }]) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => switchLanguage(code as Locale)}
                        className={locale === code ? 'bg-accent' : ''}
                    >
                        <span className="mr-2 text-lg">{flag}</span>
                        {name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
