'use client'

import { AttributeDialog } from '@/components/admin/attributes/attribute-dialog'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteAttribute } from '@/lib/actions/attribute.actions'
import { IAttribute } from '@/lib/db/models/attribute.model'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'


export const getColumns = (t: any, tCommon: any): ColumnDef<IAttribute>[] => [
    {
        accessorKey: 'name',
        header: t('name'),
        cell: ({ row }) => {
            const name = row.original.name
            const isGlobal = row.original.isGlobal
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-navy">{name}</span>
                    {isGlobal && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-blue-100 text-blue-600 font-bold uppercase tracking-tight border border-blue-200">
                            Global
                        </span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: 'values',
        header: t('values'),
        cell: ({ row }) => {
            const values = row.original.values
            return <span>{values.join(', ')}</span>
        },
    },
    {
        accessorKey: 'isApproved',
        header: tCommon('approved'),
        cell: ({ row }) => {
            const isApproved = row.original.isApproved
            return (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${isApproved ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}
                >
                    {isApproved ? tCommon('yes') : tCommon('no')}
                </span>
            )
        },
    },
    {
        accessorKey: 'status',
        header: tCommon('status'),
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                >
                    {status ? tCommon('active') : tCommon('inactive')}
                </span>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

interface CellActionProps {
    data: IAttribute
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { showSuccess, showError } = useToast()
    const t = useTranslations('admin.attributes')

    const onDelete = async () => {
        try {
            setLoading(true)
            const res = await deleteAttribute(data._id, data.storeId || '')
            if (res.success) {
                showSuccess(t('deletedSuccessfully'))
            } else {
                showError(res.message)
            }
        } catch (error) {
            showError(t('error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <AttributeDialog
                storeId={data.storeId || ''}
                attribute={data}
                open={open}
                onOpenChange={setOpen}
            />
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => setOpen(true)}
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                        if (confirm(t('deleteConfirmDescription'))) {
                            onDelete()
                        }
                    }}
                    disabled={loading}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </>
    )
}
