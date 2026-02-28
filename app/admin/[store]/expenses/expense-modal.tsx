'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExpenseInputSchema } from '@/lib/validator'
import { createExpense, getExpenseCategories } from '@/lib/actions/expense.actions'
import { toast } from 'sonner'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpenseModalProps {
    storeId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ExpenseModal({
    storeId,
    isOpen,
    onClose,
    onSuccess,
}: ExpenseModalProps) {
    const t = useTranslations('admin.expenses')
    const [categories, setCategories] = React.useState<string[]>([])
    const [openPopover, setOpenPopover] = React.useState(false)
    const [customCategory, setCustomCategory] = React.useState("")

    const todayLocal = React.useMemo(() => {
        const d = new Date()
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
    }, [])

    const form = useForm({
        resolver: zodResolver(ExpenseInputSchema),
        defaultValues: {
            amount: 0,
            category: "",
            description: "",
            date: new Date(),
            storeId: storeId,
        },
    })

    React.useEffect(() => {
        if (isOpen) {
            getExpenseCategories(storeId).then(setCategories)
            form.reset({
                amount: 0,
                category: "",
                description: "",
                date: new Date(),
                storeId: storeId,
            })
        }
    }, [isOpen, storeId, form])

    const onSubmit = async (values: any) => {
        const res = await createExpense(values)
        if (res.success) {
            toast.success(t('expenseCreated'))
            onSuccess()
            onClose()
        } else {
            toast.error(res.message || t('error'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('addExpense')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('amount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t('category')}</FormLabel>
                                    <Popover open={openPopover} onOpenChange={setOpenPopover}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openPopover}
                                                    className={cn(
                                                        "w-full justify-between font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value || t('categoryPlaceholder')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder={t('search')}
                                                    onValueChange={setCustomCategory}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start text-orange"
                                                            onClick={() => {
                                                                field.onChange(customCategory)
                                                                setOpenPopover(false)
                                                            }}
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            {t('addCustomCategory', { category: customCategory })}
                                                        </Button>
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((category) => (
                                                            <CommandItem
                                                                key={category}
                                                                value={category}
                                                                onSelect={() => {
                                                                    field.onChange(category)
                                                                    setOpenPopover(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        category === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {category}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('date')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            max={todayLocal}
                                            value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(new Date(e.target.value + 'T00:00:00'))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t('cancel')}
                            </Button>
                            <Button type="submit" className="bg-orange hover:bg-orange-dark">
                                {t('addExpense')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
