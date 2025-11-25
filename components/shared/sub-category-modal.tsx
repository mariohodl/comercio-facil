'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubCategoryInputSchema } from '@/lib/validator'
import { ISubCategoryInput } from '@/types'
import { ISubCategory } from '@/lib/db/models/sub-category.model'
import { createSubCategory, updateSubCategory } from '@/lib/actions/sub-category.actions'
import { getActiveCategories } from '@/lib/actions/category.actions'
import { useToast } from '@/hooks/use-toast'
import { toSlug } from '@/lib/utils'
import { UploadButton } from '@/lib/uploadthing'
import Image from 'next/image'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

interface SubCategoryModalProps {
    open: boolean
    onClose: () => void
    subCategory?: ISubCategory | null
    onSuccess?: () => void
}

export function SubCategoryModal({ open, onClose, subCategory, onSuccess }: SubCategoryModalProps) {
    const { showSuccess, showError } = useToast()
    const isEditMode = !!subCategory
    const [categories, setCategories] = useState<{ categoryName: string; categorySlug: string; _id: string }[]>([])

    const form = useForm<ISubCategoryInput>({
        resolver: zodResolver(SubCategoryInputSchema),
        defaultValues: {
            name: '',
            slug: '',
            parentCategory: '',
            code: '',
            description: '',
            image: '',
            status: true,
        },
    })

    useEffect(() => {
        const fetchCategories = async () => {
            const activeCategories = await getActiveCategories()
            setCategories(activeCategories as any)
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        if (subCategory) {
            form.reset({
                name: subCategory.name,
                slug: subCategory.slug,
                parentCategory: typeof subCategory.parentCategory === 'object' ? (subCategory.parentCategory as any)._id : subCategory.parentCategory,
                code: subCategory.code,
                description: subCategory.description || '',
                image: subCategory.image || '',
                status: subCategory.status,
            })
        } else {
            form.reset({
                name: '',
                slug: '',
                parentCategory: '',
                code: '',
                description: '',
                image: '',
                status: true,
            })
        }
    }, [subCategory, form])

    const handleNameChange = (value: string) => {
        const slug = toSlug(value)
        form.setValue('slug', slug)
    }

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
        } catch (error) {
            showError('An error occurred. Please try again.')
        }
    }

    const handleClose = () => {
        form.reset()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            {isEditMode ? 'Edit Sub Category' : 'Add Sub Category'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        {/* Image Upload */}
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col items-center gap-4 border-2 border-dashed rounded-lg p-4">
                                            {field.value ? (
                                                <div className="relative h-32 w-32">
                                                    <Image
                                                        src={field.value}
                                                        alt="Sub Category Image"
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                        onClick={() => field.onChange('')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <UploadButton
                                                        endpoint="imageUploader"
                                                        onClientUploadComplete={(res) => {
                                                            console.log('Upload response:', res);
                                                            const url = res[0].ufsUrl || res[0].url;
                                                            field.onChange(url)
                                                            showSuccess('Image uploaded successfully')
                                                        }}
                                                        onUploadError={(error: Error) => {
                                                            showError(`ERROR! ${error.message}`)
                                                        }}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        JPEG, PNG up to 4MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="parentCategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
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
                                        <FormLabel>Sub Category <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter sub category name"
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="sub-category-slug"
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
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Code <span className="text-red-500">*</span></FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input placeholder="CT001" {...field} disabled />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                className="bg-orange hover:bg-orange-dark text-white"
                                                onClick={() => {
                                                    const catId = form.getValues('parentCategory')
                                                    const subName = form.getValues('name')
                                                    if (!catId || !subName) {
                                                        showError('Please select a category and enter a name first')
                                                        return
                                                    }
                                                    const category = categories.find(c => c._id === catId)
                                                    if (category) {
                                                        const catPrefix = category.categoryName.substring(0, 3).toUpperCase()
                                                        const subPrefix = subName.substring(0, 3).toUpperCase()
                                                        const randomNum = Math.floor(100 + Math.random() * 900)
                                                        const code = `${catPrefix}${subPrefix}-${randomNum}`
                                                        form.setValue('code', code)
                                                    }
                                                }}
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <FormLabel>Status</FormLabel>
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="bg-orange hover:bg-orange-dark text-white"
                            >
                                {form.formState.isSubmitting
                                    ? 'Saving...'
                                    : isEditMode
                                        ? 'Update Sub Category'
                                        : 'Add Sub Category'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
