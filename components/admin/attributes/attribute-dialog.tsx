'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { createAttribute, updateAttribute } from '@/lib/actions/attribute.actions'
import { IAttribute } from '@/lib/db/models/attribute.model'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    values: z.string().min(1, 'Values are required'),
    status: z.boolean().default(true),
})

interface AttributeDialogProps {
    storeId: string
    attribute?: IAttribute
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AttributeDialog({
    storeId,
    attribute,
    trigger,
    open,
    onOpenChange,
}: AttributeDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    const t = useTranslations('admin.attributes')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: attribute?.name || '',
            values: attribute?.values.join(', ') || '',
            status: attribute?.status ?? true,
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formattedValues = values.values.split(',').map((v) => v.trim()).filter(Boolean)

            if (attribute) {
                const res = await updateAttribute(attribute._id, {
                    name: values.name,
                    values: formattedValues,
                    status: values.status,
                })
                if (res.success) {
                    showSuccess(t('updatedSuccessfully'))
                    setIsOpen(false)
                    onOpenChange?.(false)
                } else {
                    showError(res.message)
                }
            } else {
                const res = await createAttribute({
                    name: values.name,
                    values: formattedValues,
                    storeId: storeId,
                    status: values.status,
                })
                if (res.success) {
                    showSuccess(t('createdSuccessfully'))
                    setIsOpen(false)
                    onOpenChange?.(false)
                    form.reset()
                } else {
                    showError(res.message)
                }
            }
            router.refresh()
        } catch (error) {
            showError('Something went wrong')
        }
    }

    const handleOpenChange = (val: boolean) => {
        setIsOpen(val)
        onOpenChange?.(val)
        if (!val && !attribute) {
            form.reset()
        }
    }

    return (
        <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {attribute ? t('editAttribute') : t('addAttribute')}
                    </DialogTitle>
                    {!attribute && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 items-start">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                {t('tip')}
                            </p>
                        </div>
                    )}
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('name')} <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('enterName')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="values"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('values')} <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('enterValues')} {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        {t('enterValuesHelp')}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>{t('status')}</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" className="bg-orange hover:bg-orange-dark text-white">
                                {attribute ? t('saveChanges') : t('addAttribute')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
