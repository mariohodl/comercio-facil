'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { BrandInputSchema } from '@/lib/validator'
import { IBrandInput } from '@/types'
import { IBrand } from '@/lib/db/models/brand.model'
import { createBrand, updateBrand } from '@/lib/actions/brand.actions'
import { useToast } from '@/hooks/use-toast'
import { UploadButton } from '@/lib/uploadthing'
import { compressImage } from '@/lib/image-compression'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { X } from 'lucide-react'

interface BrandModalProps {
    open: boolean
    onClose: () => void
    brand?: IBrand | null
    onSuccess?: () => void
    storeId: string
}

export function BrandModal({ open, onClose, brand, onSuccess, storeId }: BrandModalProps) {
    const { showSuccess, showError, showToast } = useToast()
    const t = useTranslations('products')
    const isEditMode = !!brand
    const lastUploadedRef = useRef<{ name: string; size: number } | null>(null)

    const form = useForm<IBrandInput>({
        resolver: zodResolver(BrandInputSchema),
        defaultValues: {
            name: '',
            image: '',
            status: true,
            storeId,
        },
    })

    useEffect(() => {
        if (brand) {
            form.reset({
                name: brand.name,
                image: brand.image,
                status: brand.status,
            })
        } else {
            form.reset({
                name: '',
                image: '',
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
                showSuccess(result.message)
                form.reset()
                onClose()
                onSuccess?.()
            } else {
                showError(result.message)
            }
        } catch (_error) {
            showError('An error occurred. Please try again.')
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
                            {isEditMode ? 'Edit Brand' : 'Add Brand'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <div className="flex gap-6">
                            {/* Image Upload - Left Side */}
                            <div className="w-1/3">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 h-40 w-full relative">
                                                    {field.value ? (
                                                        <div className="relative h-full w-full">
                                                            <Image
                                                                src={field.value}
                                                                alt="Brand Image"
                                                                fill
                                                                className="object-contain rounded-md"
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
                                                        <div className="flex flex-col items-center text-center">
                                                            <div className="mb-2">
                                                                <span className="text-2xl text-gray-300">+</span>
                                                            </div>
                                                            <p className="text-sm font-medium mb-2">Add Image</p>
                                                            <UploadButton
                                                                endpoint="imageUploader"
                                                                onBeforeUploadBegin={async (files) => {
                                                                    if (files.length > 0) {
                                                                        const duplicates = files.filter(f => lastUploadedRef.current &&
                                                                            lastUploadedRef.current.name === f.name &&
                                                                            lastUploadedRef.current.size === f.size);
                                                                        if (duplicates.length > 0) {
                                                                            showError(t('fileAlreadyUploaded', { name: duplicates[0].name }));
                                                                            return [];
                                                                        }
                                                                        lastUploadedRef.current = { name: files[0].name, size: files[0].size };
                                                                    }
                                                                    showToast(t('compressingImages') || 'Compressing image...', { duration: 2000 });
                                                                    const compressedFiles = await Promise.all(
                                                                        files.map(async (file) => {
                                                                            return await compressImage(file);
                                                                        })
                                                                    );
                                                                    return compressedFiles;
                                                                }}
                                                                onClientUploadComplete={(res) => {
                                                                    if (res && res.length > 0) {
                                                                        const url = res[0].ufsUrl || res[0].url;
                                                                        field.onChange(url)
                                                                        showSuccess(t('imageUploadedSuccessfully') || 'Image uploaded successfully')
                                                                    }
                                                                }}
                                                                onUploadError={(error: Error) => {
                                                                    showError(`ERROR! ${error.message}`)
                                                                }}
                                                                appearance={{
                                                                    button: "bg-orange hover:bg-orange-dark text-white text-xs px-2 py-1 h-auto w-auto",
                                                                    allowedContent: "hidden"
                                                                }}
                                                                content={{
                                                                    button: "Upload Image"
                                                                }}
                                                            />
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                JPEG, PNG up to 2 MB
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Form Fields - Right Side */}
                            <div className="w-2/3 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Brand <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter brand name"
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
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
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
                                        ? 'Update Brand'
                                        : 'Add Brand'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
