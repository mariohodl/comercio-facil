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
import { updateUser } from '@/lib/actions/user.actions'
import { USER_ROLES } from '@/lib/constants'
import { IUser } from '@/lib/db/models/user.model'
import { UserUpdateSchema, StoreUserUpdateSchema } from '@/lib/validator'

const UserEditForm = ({ user, storeId }: { user: any; storeId: string }) => {
  const router = useRouter()
  const { showError, showSuccess } = useToast()

  const form = useForm<z.infer<typeof StoreUserUpdateSchema>>({
    resolver: zodResolver(StoreUserUpdateSchema),
    defaultValues: {
      _id: user._id,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      status: user.status ?? true,
      storeId: storeId,
      pin: '',
      password: '',
      confirmPassword: '',
    },
  })

  const selectedRole = form.watch('role')
  const isSeller = selectedRole === 'Seller'

  async function onSubmit(values: z.infer<typeof StoreUserUpdateSchema>) {
    try {
      const { createStoreUser, updateStoreUser } = await import('@/lib/actions/user.actions')
      const res = await updateStoreUser(values)

      if (!res.success)
        return showError(res.message, { duration: 3000, position: 'top-center', important: true })

      showSuccess(res.message, { duration: 3000, position: 'top-center', important: true })
      router.push(`/admin/${storeId}/users`)
    } catch (error: any) {
      showError(error?.message, { duration: 3000, position: 'top-center', important: true })
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
                  <Input placeholder='Nombre del usuario' {...field} />
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
                <FormLabel>Correo Electrónico {isSeller && '(Opcional)'}</FormLabel>
                <FormControl>
                  <Input placeholder='correo@ejemplo.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isSeller && (
            <FormField
              control={form.control}
              name='pin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo PIN (4 dígitos)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Dejar vacío para no cambiar'
                      maxLength={4}
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        field.onChange(val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full border-t pt-4">
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder='Dejar vacío para no cambiar' {...field} />
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
                    <Input type="password" placeholder='Dejar vacío para no cambiar' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            {form.formState.isSubmitting ? 'Guardando...' : `Actualizar Usuario`}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default UserEditForm