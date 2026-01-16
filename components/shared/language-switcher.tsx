'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
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
                    size="icon"
                    className="rounded-full w-10 h-10 hover:bg-gray-100 transition-colors"
                    disabled={isPending}
                >
                    <span className="text-xl leading-none">{languages[locale].flag}</span>
                    <span className="sr-only">{languages[locale].name}</span>
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
