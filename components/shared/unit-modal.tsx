'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UnitInputSchema } from '@/lib/validator'
import { IUnitInput } from '@/types'
import { IUnit } from '@/lib/db/models/unit.model'
import { createUnit, updateUnit } from '@/lib/actions/unit.actions'
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

interface UnitModalProps {
    open: boolean
    onClose: () => void
    unit?: IUnit | null
    onSuccess?: () => void
}

export function UnitModal({ open, onClose, unit, onSuccess }: UnitModalProps) {
    const { showSuccess, showError } = useToast()
    const isEditMode = !!unit

    const form = useForm<IUnitInput>({
        resolver: zodResolver(UnitInputSchema),
        defaultValues: {
            name: '',
            abbreviation: '',
            status: true,
        },
    })

    useEffect(() => {
        if (unit) {
            form.reset({
                name: unit.name,
                abbreviation: unit.abbreviation,
                status: unit.status,
            })
        } else {
            form.reset({
                name: '',
                abbreviation: '',
                status: true,
            })
        }
    }, [unit, form])

    const onSubmit = async (data: IUnitInput) => {
        try {
            let result
            if (isEditMode && unit) {
                result = await updateUnit({ ...data, _id: unit._id })
            } else {
                result = await createUnit(data)
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            {isEditMode ? 'Edit Unit' : 'Add Unit'}
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
                                            Name <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter unit name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="abbreviation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Abbreviation <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter abbreviation (e.g. kg, m, pc)"
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
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Status</FormLabel>
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
                                        ? 'Update Unit'
                                        : 'Add Unit'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
