'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { UnitInputSchema } from '@/lib/validator'
import { IUnitInput } from '@/types'
import { IUnit } from '@/lib/db/models/unit.model'
import { createUnit, updateUnit } from '@/lib/actions/unit.actions'
import { getSuggestedAbbreviation } from '@/lib/actions/ai.actions'
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
    storeId: string
}

export function UnitModal({ open, onClose, unit, onSuccess, storeId }: UnitModalProps) {
    const t = useTranslations('inventory')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const isEditMode = !!unit

    const form = useForm<IUnitInput>({
        resolver: zodResolver(UnitInputSchema),
        defaultValues: {
            name: '',
            abbreviation: '',
            status: true,
            storeId,
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
                storeId,
            })
        }
    }, [unit, form])
    const unitName = form.watch('name')

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (unitName && unitName.length > 2) {
                const suggestion = await getSuggestedAbbreviation(unitName)
                if (suggestion) {
                    form.setValue('abbreviation', suggestion)
                }
            }
        }, 800)

        return () => clearTimeout(timer)
    }, [unitName, form])

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
                            {isEditMode ? t('editUnit') : t('addUnit')}
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
                                            {t('unitName')} <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('enterUnitName')}
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
                                        ? t('updateUnit')
                                        : t('addUnit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
