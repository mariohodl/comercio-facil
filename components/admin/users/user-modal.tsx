'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { X, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { StoreUserCreateSchema, StoreUserUpdateSchema } from '@/lib/validator'
import { createStoreUser, updateStoreUser } from '@/lib/actions/user.actions'
import { USER_ROLES } from '@/lib/constants'
import { IUser } from '@/lib/db/models/user.model'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    storeId: string
    user?: IUser | null
    mode: 'add' | 'edit' | 'view'
}

export function UserModal({ isOpen, onClose, storeId, user, mode }: UserModalProps) {
    const t = useTranslations('admin.users')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const isAddMode = mode === 'add'
    const isViewMode = mode === 'view'
    const isRestrictedAdmin = mode === 'edit' && user?.role === 'Admin' && user?.isStore

    const schema = isAddMode ? StoreUserCreateSchema : StoreUserUpdateSchema

    const form = useForm<any>({
        resolver: zodResolver(schema as any),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || (user as any)?.address?.phone || '',
            role: user?.role || 'Seller',
            status: user?.status ?? true,
            storeId: storeId,
            password: '',
            confirmPassword: '',
            pin: '',
            ...(isAddMode ? {} : { _id: user?._id }),
        } as any,
    })

    const role = form.watch('role')
    const isSeller = role === 'Seller'

    useEffect(() => {
        if (isOpen && user) {
            form.reset({
                name: user.name,
                email: user.email,
                phone: user.phone || (user as any).address?.phone || '',
                role: user.role,
                status: user.status ?? true,
                storeId: storeId,
                password: '',
                confirmPassword: '',
                pin: '',
                ...(isAddMode ? {} : { _id: user._id }),
            } as any)
        } else if (isOpen && isAddMode) {
            form.reset({
                name: '',
                email: '',
                phone: '',
                role: 'Seller',
                status: true,
                storeId: storeId,
                password: '',
                confirmPassword: '',
                pin: '',
            } as any)
        }
    }, [isOpen, user, isAddMode, form, storeId])

    async function onSubmit(values: any) {
        if (isViewMode) return

        try {
            const res = isAddMode
                ? await createStoreUser(values)
                : await updateStoreUser(values)

            if (res.success) {
                toast.success(res.message)
                onClose()
            } else {
                toast.error(res.message)
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-bold text-navy">
                        {isAddMode ? t('addUser') : isViewMode ? t('viewUser') : t('editUser')}
                    </DialogTitle>
                    <button
                        onClick={onClose}
                        aria-label={t('close')}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-navy font-semibold">{t('name')} <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isViewMode || isRestrictedAdmin}
                                                    className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-navy font-semibold">{t('role')} <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={isViewMode || isRestrictedAdmin}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg">
                                                        <SelectValue placeholder={t('selectRole')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {USER_ROLES.map((role) => (
                                                        <SelectItem key={role} value={role}>{t(`roles.${role}`)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* PIN field for Sellers */}
                            {isSeller && !isViewMode && (
                                <FormField
                                    control={form.control}
                                    name="pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-navy font-semibold">PIN de Seguridad (4 dígitos) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    maxLength={4}
                                                    placeholder="XXXX"
                                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                    className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg text-lg tracking-widest text-center"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground mt-1">Este PIN se usará para iniciar sesión rápidamente en el POS.</p>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {!isSeller && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-navy font-semibold">{t('email')} <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        disabled={isViewMode || isRestrictedAdmin}
                                                        className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-navy font-semibold">{t('phone')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={isViewMode || isRestrictedAdmin}
                                                        className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {!isViewMode && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-navy font-semibold">{t('password')} {!isAddMode ? '' : <span className="text-red-500">*</span>}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type={showPassword ? 'text' : 'password'}
                                                                    placeholder={!isAddMode ? '••••••••' : ''}
                                                                    className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg pr-10"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-navy font-semibold">{t('confirmPassword')} {!isAddMode ? '' : <span className="text-red-500">*</span>}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                                    placeholder={!isAddMode ? '••••••••' : ''}
                                                                    className="h-12 border-gray-200 focus:border-orange focus:ring-orange rounded-lg pr-10"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <FormLabel className="text-navy font-semibold">{t('status')}</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isViewMode || isRestrictedAdmin}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="h-11 px-8 rounded-lg bg-navy text-white hover:bg-navy/90 hover:text-white"
                            >
                                {t('cancel')}
                            </Button>
                            {!isViewMode && (
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="h-11 px-8 rounded-lg bg-orange hover:bg-orange-600 text-white shadow-lg shadow-orange/20"
                                >
                                    {isAddMode ? t('addUser') : t('saveChanges')}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
