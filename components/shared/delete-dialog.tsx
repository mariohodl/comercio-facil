'use client'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
// import { useToast } from '@/hooks/use-toast'

export default function DeleteDialogWithAction({
  id,
  action,
  callbackAction,
}: {
  id: string
  action: (id: string) => Promise<{ success: boolean; message: string }>
  callbackAction?: () => void,
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('common')
  //   const { toast } = useToast()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size='sm' className='w-20' variant='outline'>
          {t('delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmDeleteDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row-reverse gap-2">
          <Button
            variant='destructive'
            size='sm'
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await action(id)
                if (!res.success) {
                  //   toast({
                  //     variant: 'destructive',
                  //     description: res.message,
                  //   })
                } else {
                  setOpen(false)
                  //   toast({
                  //     description: res.message,
                  //   })
                  if (callbackAction) callbackAction()
                }
              })
            }
          >
            {isPending ? t('deleting') : t('delete')}
          </Button>
          <AlertDialogCancel className="w-full sm:w-auto mt-0">{t('cancel')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Named export version with simpler API for reusability
export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
}) {
  const t = useTranslations('common')
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || t('confirmDeleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{description || t('confirmDeleteDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row-reverse gap-2">
          <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto">
            {t('delete')}
          </Button>
          <AlertDialogCancel className="w-full sm:w-auto mt-0">{t('cancel')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}