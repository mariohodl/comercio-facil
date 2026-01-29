'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubCategoryInputSchema } from '@/lib/validator'
import { ISubCategoryInput } from '@/types'
import { ISubCategory } from '@/lib/db/models/sub-category.model'
import { createSubCategory, updateSubCategory } from '@/lib/actions/sub-category.actions'
import { getActiveCategories } from '@/lib/actions/category.actions'
import { ICategory } from '@/lib/db/models/category.model'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface SubCategoryModalProps {
    open: boolean
    onClose: () => void
    subCategory?: ISubCategory | null
    onSuccess?: () => void
    storeId: string
}

export function SubCategoryModal({ open, onClose, subCategory, onSuccess, storeId }: SubCategoryModalProps) {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const isEditMode = !!subCategory
    const [categories, setCategories] = useState<ICategory[]>([])
    const [loadingCategories, setLoadingCategories] = useState(false)

    const form = useForm<ISubCategoryInput>({
        resolver: zodResolver(SubCategoryInputSchema),
        defaultValues: {
            name: '',
            parentCategory: '',
            storeId,
        },
    })

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true)
            try {
                const cats = await getActiveCategories(storeId)
                setCategories(cats)
            } catch (error) {
                console.error('Error fetching categories:', error)
            } finally {
                setLoadingCategories(false)
            }
        }

        if (open) {
            fetchCategories()
        }
    }, [open, storeId])

    useEffect(() => {
        if (subCategory) {
            form.reset({
                name: subCategory.name,
                parentCategory: subCategory.parentCategory as any, // ID
                storeId,
            })
        } else {
            form.reset({
                name: '',
                parentCategory: '',
                storeId,
            })
        }
    }, [subCategory, form, storeId])



    const onSubmit = async (data: ISubCategoryInput) => {
        try {
            let result
            if (isEditMode && subCategory) {
                result = await updateSubCategory({ ...data, _id: subCategory._id })
            } else {
                result = await createSubCategory(data)
            }

            if (result.success) {
                showSuccess(result.message)
                form.reset()
                onClose()
                onSuccess?.()
            } else {
                showError(result.message)
            }
        } catch (_error) {
            showError(tCommon('error'))
        }
    }

    const handleClose = () => {
        form.reset()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            {isEditMode ? t('editSubCategory') : t('addSubCategory')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="parentCategory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('parentCategory')} <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loadingCategories}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectCategory')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.categoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {tCommon('name')} <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('enterSubCategoryName')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
                                        ? t('updateSubCategory')
                                        : t('addSubCategory')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
