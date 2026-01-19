import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { useToast } from '@/hooks/use-toast'
import { createCustomer } from '@/lib/actions/customer.actions'
import { ICustomer } from '@/lib/db/models/customer.model'

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CreateCustomerModalProps {
    onSuccess: (customer: ICustomer) => void
    storeId: string
}

export default function CreateCustomerModal({ onSuccess, storeId }: CreateCustomerModalProps) {
    const t = useTranslations('pos')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
        },
    })

    const onSubmit = async (data: CustomerFormValues) => {
        setIsLoading(true)
        try {
            // Clean up empty strings to undefined
            const cleanData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, value === '' ? undefined : value])
            ) as any

            const result = await createCustomer({ ...cleanData, storeId })

            if (result.success) {
                showSuccess(result.message)
                setOpen(false)
                form.reset()
                if (result.data) {
                    onSuccess(result.data)
                }
            } else {
                showError(result.message)
            }
        } catch (error) {
            showError(tCommon('somethingWentWrong'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="bg-teal-700 hover:bg-teal-800 text-white shrink-0">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t('createCustomer')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        <FormLabel>{t('name')} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('namePlaceholder')} {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        <FormLabel>{t('phone')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('phonePlaceholder')} {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>{t('email')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('emailPlaceholder')} {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>{t('address')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('addressPlaceholder')} {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>{t('city')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('cityPlaceholder')} {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                                {tCommon('cancel')}
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto bg-orange hover:bg-orange-dark text-white" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tCommon('submit')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
