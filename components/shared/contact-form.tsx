'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { ContactInputSchema } from '@/lib/validator'
import { createContact } from '@/lib/actions/contact.actions'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send } from 'lucide-react'

export default function ContactForm() {
    const t = useTranslations('publicPages.contact')
    const { showSuccess, showError } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof ContactInputSchema>>({
        resolver: zodResolver(ContactInputSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    })

    const onSubmit = async (data: z.infer<typeof ContactInputSchema>) => {
        setIsSubmitting(true)
        try {
            const res = await createContact(data)
            if (res.success) {
                showSuccess(t('success'))
                form.reset()
            } else {
                showError(t('error'))
            }
        } catch (error) {
            console.error(error)
            showError(t('error'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-900/5 border border-gray-100">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{t('formTitle')}</h3>
                <p className="text-gray-600 mt-2">{t('formDescription')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">{t('name')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="rounded-xl border-gray-200 focus:border-blue-500 h-12"
                                            placeholder="Ej. Roberto García"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-semibold">{t('email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            className="rounded-xl border-gray-200 focus:border-blue-500 h-12"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-semibold">{t('subject')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="rounded-xl border-gray-200 focus:border-blue-500 h-12"
                                        placeholder="¿En qué podemos ayudarte?"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-semibold">{t('message')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        rows={5}
                                        className="rounded-xl border-gray-200 focus:border-blue-500 min-h-[150px] resize-none"
                                        placeholder="Cuéntanos más detalles..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <Send className="h-5 w-5 mr-2" />
                        )}
                        {t('submit')}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
