'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react'
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 md:px-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-navy">{t('userName')}</h1>
                    <p className="text-sm text-muted-foreground">{t('manageUsers')}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 md:p-6 rounded-xl border border-neutral-warm shadow-sm mx-2 md:mx-0">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-orange" />
                    <form onSubmit={handleSearch} className="w-full">
                        <Input
                            placeholder={t('search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 w-full bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                        />
                    </form>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => openModal('add')}
                        className="bg-orange hover:bg-orange-dark text-white h-11 px-6 shadow-md shadow-orange/20 font-bold flex-1 sm:flex-none"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{t('addUser')}</span>
                        <span className="sm:hidden">{tCommon('add')}</span>
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-2 md:mx-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold text-navy py-4 min-w-[200px]">{t('userName')}</TableHead>
                                <TableHead className="font-bold text-navy py-4 min-w-[150px]">{t('phone')}</TableHead>
                                <TableHead className="font-bold text-navy py-4 min-w-[200px]">{t('email')}</TableHead>
                                <TableHead className="font-bold text-navy py-4 min-w-[100px]">{t('role')}</TableHead>
                                <TableHead className="font-bold text-navy py-4 min-w-[100px]">{t('status')}</TableHead>
                                <TableHead className="font-bold text-navy py-4 text-right w-[120px]">{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-gray-300" />
                                            <p>{t('noUsersFound')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors border-b last:border-0">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-sm shadow-sm flex-shrink-0 ${['bg-blue-50 text-blue-600 border border-blue-100',
                                                    'bg-purple-50 text-purple-600 border border-purple-100',
                                                    'bg-orange-50 text-orange-600 border border-orange-100',
                                                    'bg-green-50 text-green-600 border border-green-100',
                                                    'bg-pink-50 text-pink-600 border border-pink-100',
                                                    'bg-cyan-50 text-cyan-600 border border-cyan-100'][user.name.length % 6]
                                                    }`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-navy truncate max-w-[150px]">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 py-4 font-medium italic">
                                            {user.phone || (user as any).address?.phone || tCommon('notAvailable')}
                                        </TableCell>
                                        <TableCell className="text-gray-600 py-4">{user.email}</TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="bg-gray-50/50 text-gray-600 border-gray-200">
                                                {t(`roles.${user.role}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {user.status !== false ? (
                                                <Badge className="bg-green-50 text-green-600 hover:bg-green-100 border-none shadow-none flex items-center gap-1 w-fit">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                    {t('active')}
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none flex items-center gap-1 w-fit">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                    {t('inactive')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openModal('view', user)}
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openModal('edit', user)}
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {!(user.role === 'Admin' && user.isStore) && (
                                                    <DeleteDialog id={user._id} action={deleteUser} />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex justify-center sm:justify-end px-2 md:px-0">
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
