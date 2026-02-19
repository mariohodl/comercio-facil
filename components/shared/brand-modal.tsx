'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { BrandInputSchema } from '@/lib/validator'
import { IBrandInput } from '@/types'
import { IBrand } from '@/lib/db/models/brand.model'
import { createBrand, updateBrand } from '@/lib/actions/brand.actions'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Switch } from '@/components/ui/switch'

interface BrandModalProps {
    open: boolean
    onClose: () => void
    brand?: IBrand | null
    onSuccess?: () => void
    storeId: string
}

export function BrandModal({ open, onClose, brand, onSuccess, storeId }: BrandModalProps) {
    const { showSuccess, showError } = useToast()
    const t = useTranslations('brandModal')
    const tCommon = useTranslations('common')
    const isEditMode = !!brand

    const form = useForm<IBrandInput>({
        resolver: zodResolver(BrandInputSchema),
        defaultValues: {
            name: '',
            status: true,
            storeId,
        },
    })

    useEffect(() => {
        if (brand) {
            form.reset({
                name: brand.name,
                status: brand.status,
            })
        } else {
            form.reset({
                name: '',
                status: true,
                storeId,
            })
        }
    }, [brand, form])

    const onSubmit = async (data: IBrandInput) => {
        try {
            let result
            if (isEditMode && brand) {
                result = await updateBrand({ ...data, _id: brand._id })
            } else {
                result = await createBrand(data)
            }

            if (result.success) {
                showSuccess(isEditMode ? t('updateSuccess') : t('createSuccess'))

                if (!isEditMode && result.brandId) {
                    // Optionally handle brandId if needed, though not directly used here for reset/close
                }
                form.reset()
                onClose()
                onSuccess?.()
            } else {
                showError(result.message || tCommon('unexpectedError'))
            }
        } catch (_error) {
            showError(tCommon('unexpectedError'))
        }
    }

    const handleClose = () => {
        form.reset()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            {isEditMode ? t('editTitle') : t('addTitle')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('brandLabel')} <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('brandPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <FormLabel>{tCommon('status')}</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="bg-navy text-white hover:bg-navy/90"
                            >
                                {tCommon('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="bg-orange hover:bg-orange-dark text-white"
                            >
                                {form.formState.isSubmitting
                                    ? tCommon('saving')
                                    : isEditMode
                                        ? t('updateProduct')
                                        : t('addProduct')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
