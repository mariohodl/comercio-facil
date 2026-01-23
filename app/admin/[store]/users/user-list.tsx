'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Eye, Plus } from 'lucide-react'
import { IUser } from '@/lib/db/models/user.model'
import { Button } from '@/components/ui/button'
import Pagination from '@/components/shared/pagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import DeleteDialog from '@/components/shared/delete-dialog'
import { deleteUser } from '@/lib/actions/user.actions'
import { UserModal } from '@/components/admin/users/user-modal'

import { useTranslations } from 'next-intl'

interface UserListProps {
    users: IUser[]
    storeId: string
    page: number
    totalPages: number
    searchTerm?: string
}

export default function UserList({ users, storeId, page, totalPages, searchTerm }: UserListProps) {
    const router = useRouter()
    const t = useTranslations('admin.users')
    const tCommon = useTranslations('common')
    const [search, setSearch] = React.useState(searchTerm || '')

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [modalMode, setModalMode] = React.useState<'add' | 'edit' | 'view'>('add')
    const [selectedUser, setSelectedUser] = React.useState<IUser | null>(null)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/admin/${storeId}/users?page=1&query=${search}`)
    }

    const openModal = (mode: 'add' | 'edit' | 'view', user: IUser | null = null) => {
        setModalMode(mode)
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div className="relative w-72">
                    <form onSubmit={handleSearch}>
                        <Input
                            placeholder={t('search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-4"
                        />
                    </form>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => openModal('add')}
                        className="bg-orange hover:bg-orange-600 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> {t('addUser')}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600">{t('userName')}</TableHead>
                            <TableHead className="font-semibold text-gray-600">{t('phone')}</TableHead>
                            <TableHead className="font-semibold text-gray-600">{t('email')}</TableHead>
                            <TableHead className="font-semibold text-gray-600">{t('role')}</TableHead>
                            <TableHead className="font-semibold text-gray-600">{t('status')}</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-right">{t('action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    {t('noUsersFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-sm shadow-inner ${['bg-blue-50 text-blue-600 border border-blue-100',
                                                    'bg-purple-50 text-purple-600 border border-purple-100',
                                                    'bg-orange-50 text-orange-600 border border-orange-100',
                                                    'bg-green-50 text-green-600 border border-green-100',
                                                    'bg-pink-50 text-pink-600 border border-pink-100',
                                                    'bg-cyan-50 text-cyan-600 border border-cyan-100'][user.name.length % 6]
                                                }`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {user.phone || (user as any).address?.phone || tCommon('notAvailable')}
                                    </TableCell>
                                    <TableCell className="text-gray-600">{user.email}</TableCell>
                                    <TableCell>
                                        <span className="text-gray-600">{t(`roles.${user.role}`)}</span>
                                    </TableCell>
                                    <TableCell>
                                        {user.status !== false ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                                                {t('active')}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">
                                                {t('inactive')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">

                                            {!(user.role === 'Admin' && user.isStore) && (
                                                <DeleteDialog id={user._id} action={deleteUser} />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openModal('view', user)}
                                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openModal('edit', user)}
                                                className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination page={page} totalPages={totalPages} />
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                storeId={storeId}
                user={selectedUser}
                mode={modalMode}
            />
        </div>
    )
}
