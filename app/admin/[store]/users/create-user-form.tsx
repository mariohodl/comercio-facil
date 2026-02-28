'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createStoreUser } from '@/lib/actions/user.actions'
import { USER_ROLES } from '@/lib/constants'
import { StoreUserCreateSchema } from '@/lib/validator'

const CreateUserForm = ({ storeId }: { storeId: string }) => {
    const router = useRouter()
    const { showError, showSuccess } = useToast()

    const form = useForm<z.infer<typeof StoreUserCreateSchema>>({
        resolver: zodResolver(StoreUserCreateSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            pin: '',
            role: 'Seller',
            storeId: storeId,
            status: true,
        },
    })

    const selectedRole = form.watch('role')
    const isSeller = selectedRole === 'Seller'

    async function onSubmit(values: z.infer<typeof StoreUserCreateSchema>) {
        try {
            const res = await createStoreUser(values)
            if (!res.success) {
                return showError(res.message || 'Error al crear el usuario', { duration: 3000, position: 'top-center', important: true })
            }

            showSuccess(res.message || 'Usuario creado correctamente', { duration: 3000, position: 'top-center', important: true })
            router.push(`/admin/${storeId}/users`)
        } catch (error: any) {
            showError(error?.message || 'Algo salió mal', { duration: 3000, position: 'top-center', important: true })
        }
    }

    return (
        <Form {...form}>
            <form
                method='post'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100'
            >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Role Selection - First because it changes other fields */}
                    <FormField
                        control={form.control}
                        name='role'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol / Perfil</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Selecciona un rol' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {USER_ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role === 'Seller' ? 'Vendedor (PIN Login)' : role}
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
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder='Nombre del vendedor' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isSeller ? (
                        <FormField
                            control={form.control}
                            name='pin'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PIN de Acceso (4 dígitos)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Ej. 1234'
                                            maxLength={4}
                                            {...field}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                field.onChange(val);
                                            }}
                                        />
                                    </FormControl>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Este PIN se usará para iniciar sesión rápidamente en el POS.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <>
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder='correo@ejemplo.com' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder='Mínimo 3 caracteres' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder='Repite la contraseña' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                </div>

                <div className='flex justify-end gap-3 pt-4 border-t'>
                    <Button
                        variant='outline'
                        type='button'
                        onClick={() => router.push(`/admin/${storeId}/users`)}
                    >
                        Cancelar
                    </Button>
                    <Button type='submit' disabled={form.formState.isSubmitting} className="bg-orange hover:bg-orange-600 text-white">
                        {form.formState.isSubmitting ? 'Creando...' : 'Crear Usuario / Vendedor'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default CreateUserForm
