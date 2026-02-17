'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CategoryInputSchema } from '@/lib/validator'
import { ICategoryInput } from '@/types'
import { ICategory } from '@/lib/db/models/category.model'
import { createCategory, updateCategory } from '@/lib/actions/category.actions'
import { useToast } from '@/hooks/use-toast'
import { toSlug } from '@/lib/utils'
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
import { SuggestedSubCategoriesDialog } from './suggested-sub-categories-dialog'

interface CategoryModalProps {
    open: boolean
    onClose: () => void
    category?: ICategory | null
    onSuccess?: () => void
    storeId: string
}

import { useTranslations } from 'next-intl'

export function CategoryModal({ open, onClose, category, onSuccess, storeId }: CategoryModalProps) {
    const t = useTranslations('categoryModal')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const isEditMode = !!category
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [createdCategory, setCreatedCategory] = useState<{ id: string, name: string } | null>(null)

    const form = useForm<ICategoryInput>({
        resolver: zodResolver(CategoryInputSchema),
        defaultValues: {
            categoryName: '',
            categorySlug: '',
            status: true,
            storeId,
        },
    })

    useEffect(() => {
        if (category) {
            form.reset({
                categoryName: category.categoryName,
                categorySlug: category.categorySlug,
                status: category.status,
            })
        } else {
            form.reset({
                categoryName: '',
                categorySlug: '',
                status: true,
                storeId,
            })
        }
    }, [category, form, storeId])

    const handleNameChange = (value: string) => {
        const slug = toSlug(value)
        form.setValue('categorySlug', slug)
    }

    const onSubmit = async (data: ICategoryInput) => {
        try {
            let result
            if (isEditMode && category) {
                result = await updateCategory({ ...data, _id: category._id })
            } else {
                result = await createCategory(data)
            }

            if (result.success) {
                showSuccess(isEditMode ? t('updateSuccess') : t('createSuccess'))

                if (!isEditMode && result.categoryId) {
                    setCreatedCategory({
                        id: result.categoryId,
                        name: result.categoryName
                    })
                    form.reset()
                    onClose()
                    setShowSuggestions(true)
                } else {
                    form.reset()
                    onClose()
                    onSuccess?.()
                }
            } else {
                showError(result.message)
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            {isEditMode ? t('editTitle') : t('addTitle')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <FormField
                            control={form.control}
                            name="categoryName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('nameLabel')} <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('namePlaceholder')}
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                handleNameChange(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categorySlug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('slugLabel')} <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('slugPlaceholder')}
                                            {...field}
                                            onChange={(e) => {
                                                const sanitized = toSlug(e.target.value)
                                                field.onChange(sanitized)
                                            }}
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
                                    <FormLabel>
                                        {t('statusLabel')} <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
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
                                        ? t('updateCategory')
                                        : t('addCategory')}
                            </Button>
                        </div>
                    </form>
                </Form>
                {/* Suggestions dialog */}
                {createdCategory && (
                    <SuggestedSubCategoriesDialog
                        open={showSuggestions}
                        onOpenChange={(open) => {
                            setShowSuggestions(open)
                            if (!open) {
                                onSuccess?.()
                                setCreatedCategory(null)
                            }
                        }}
                        categoryName={createdCategory.name}
                        categoryId={createdCategory.id}
                        storeId={storeId}
                    />
                )}
            </DialogContent>

        </Dialog>
    )
}
