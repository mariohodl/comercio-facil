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

    const form = useForm<z.infer<typeof StoreUserCreateSchema>>({
        resolver: zodResolver(StoreUserCreateSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'Seller',
            storeId: storeId,
        },
    })

    const { showError, showSuccess } = useToast()

    async function onSubmit(values: z.infer<typeof StoreUserCreateSchema>) {
        try {
            const res = await createStoreUser(values)
            if (!res.success) {
                return showError(res.message || 'Failed to create user', { duration: 3000, position: 'top-center', important: true })
            }

            showSuccess(res.message || 'User created successfully', { duration: 3000, position: 'top-center', important: true })
            router.push(`/admin/${storeId}/users`)
        } catch (error: any) {
            showError(error?.message || 'Something went wrong', { duration: 3000, position: 'top-center', important: true })
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
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter full name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder='Enter email address' {...field} />
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder='Enter password' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='role'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a role' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {USER_ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end gap-3 pt-4 border-t'>
                    <Button
                        variant='outline'
                        type='button'
                        onClick={() => router.push(`/admin/${storeId}/users`)}
                    >
                        Cancel
                    </Button>
                    <Button type='submit' disabled={form.formState.isSubmitting} className="bg-orange hover:bg-orange-600 text-white">
                        {form.formState.isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default CreateUserForm
