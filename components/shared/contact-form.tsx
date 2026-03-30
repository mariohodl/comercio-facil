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
import { Loader2, Send, CheckCircle2, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactForm() {
    const t = useTranslations('publicPages.contact')
    const { showSuccess, showError } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

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
                setIsSubmitted(true)
                form.reset()
                setTimeout(() => setIsSubmitted(false), 8000)
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
        <div className="relative p-8 md:p-12">
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mb-12">
                            <div className="w-12 h-12 bg-orange-50 text-orange rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-black text-navy tracking-tight leading-none mb-4">
                                {t('formTitle')}
                            </h3>
                            <p className="text-navy/50 text-base font-medium leading-relaxed">
                                {t('formDescription')}
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-navy font-black text-xs uppercase tracking-widest ml-1 opacity-60">
                                                    {t('name')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-orange/30 h-14 px-6 text-navy font-medium transition-all shadow-sm focus:ring-4 focus:ring-orange/5"
                                                        placeholder="Cual es tu nombre?"
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-navy font-black text-xs uppercase tracking-widest ml-1 opacity-60">
                                                    {t('email')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-orange/30 h-14 px-6 text-navy font-medium transition-all shadow-sm focus:ring-4 focus:ring-orange/5"
                                                        placeholder="Tu correo de contacto"
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-navy font-black text-xs uppercase tracking-widest ml-1 opacity-60">
                                                    {t('subject')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-orange/30 h-14 px-6 text-navy font-medium transition-all shadow-sm focus:ring-4 focus:ring-orange/5"
                                                        placeholder="De qué trata tu mensaje?"
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-navy font-black text-xs uppercase tracking-widest ml-1 opacity-60">
                                                    {t('message')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={4}
                                                        className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-orange/30 p-6 text-navy font-medium transition-all shadow-sm focus:ring-4 focus:ring-orange/5 resize-none min-h-[120px]"
                                                        placeholder="Cuéntanos cómo podemos apoyarte..."
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-16 bg-orange hover:bg-orange-dark text-white text-lg font-black rounded-2xl shadow-xl shadow-orange/20 transition-all active:scale-[0.98] group"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                                    ) : (
                                        <Send className="h-5 w-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                    {t('submit')}
                                </Button>
                            </form>
                        </Form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-16 text-center space-y-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-24 h-24 bg-orange-50 text-orange rounded-full flex items-center justify-center mx-auto shadow-xl shadow-orange/10 border border-orange-100"
                        >
                            <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-navy tracking-tight leading-tight">
                                {t('success')}
                            </h3>
                            <p className="text-navy/50 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                                Gracias por escribirnos. Pronto te contactaremos para dar seguimiento a tu solicitud.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsSubmitted(false)}
                            className="rounded-2xl px-10 h-14 font-black text-orange border-orange/20 hover:bg-orange/5 hover:border-orange/40 transition-all"
                        >
                            Enviar otro mensaje
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
