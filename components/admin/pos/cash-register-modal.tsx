'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from '@/lib/utils'
import { Loader2, Plus, Minus, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ICashRegisterSession } from '@/lib/db/models/cash-register.model'

interface CashRegisterModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    storeId: string
}

export default function CashRegisterModal({ open, onOpenChange, storeId }: CashRegisterModalProps) {
    const [loading, setLoading] = useState(false)
    const [session, setSession] = useState<ICashRegisterSession | null>(null)
    const [view, setView] = useState<'details' | 'open' | 'close' | 'movement'>('details')
    const [amount, setAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [movementType, setMovementType] = useState<'deposit' | 'withdrawal'>('deposit')
    const { showSuccess, showError } = useToast()

    // Translation hook (assuming we might adding keys later, using hardcoded for now based on request)
    const t = useTranslations('pos')

    useEffect(() => {
        if (open) {
            fetchSessionStatus()
        }
    }, [open, storeId])

    const fetchSessionStatus = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/cash-register/status?storeId=${storeId}`)
            const data = await res.json()
            if (res.ok) {
                showSuccess('Cash register status loaded')
                setSession(data.session)
                if (!data.session) {
                    setView('open')
                } else {
                    setView('details')
                }
            } else {
                showError(data.message)
            }
        } catch (error) {
            showError('Failed to fetch status')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenRegister = async () => {
        if (!amount) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cash-register/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, openingAmount: Number(amount) })
            })
            const data = await res.json()
            if (res.ok) {
                showSuccess('Cash register opened')
                setSession(data.session)
                setView('details')
                setAmount('')
            } else {
                showError(data.message)
            }
        } catch (error) {
            showError('Failed to open register')
        } finally {
            setLoading(false)
        }
    }

    const handleCloseRegister = async () => {
        if (!amount) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cash-register/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, closingAmount: Number(amount) })
            })
            const data = await res.json()
            if (res.ok) {
                showSuccess('Cash register closed')
                setSession(null)
                setView('open')
                setAmount('')
                onOpenChange(false)
            } else {
                showError(data.message)
            }
        } catch (error) {
            showError('Failed to close register')
        } finally {
            setLoading(false)
        }
    }

    const handleMovement = async () => {
        if (!amount || !notes) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cash-register/movement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, type: movementType, amount: Number(amount), notes })
            })
            const data = await res.json()
            if (res.ok) {
                showSuccess('Movement recorded')
                setSession(data.session)
                setView('details')
                setAmount('')
                setNotes('')
            } else {
                showError(data.message)
            }
        } catch (error) {
            showError('Failed to record movement')
        } finally {
            setLoading(false)
        }
    }

    // Calculations
    const openingAmount = session?.openingAmount || 0
    const salesTotal = session?.movements
        .filter(m => m.type === 'sale')
        .reduce((acc, curr) => acc + curr.amount, 0) || 0

    // Calculate cash payments only if we had payment method details, but for now assuming all sales contribute to "Total Sale Amount"
    // The requirement says "Cash Payment" separate.
    // In our model we store paymentMethod.
    const cashSales = session?.movements
        .filter(m => m.type === 'sale' && m.paymentMethod === 'Cash')
        .reduce((acc, curr) => acc + curr.amount, 0) || 0

    const deposits = session?.movements
        .filter(m => m.type === 'deposit')
        .reduce((acc, curr) => acc + curr.amount, 0) || 0

    const withdrawals = session?.movements
        .filter(m => m.type === 'withdrawal')
        .reduce((acc, curr) => acc + curr.amount, 0) || 0

    const totalCash = openingAmount + cashSales + deposits - withdrawals

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {view === 'open' && 'Open Cash Register'}
                        {view === 'details' && 'Cash Register Details'}
                        {view === 'close' && 'Close Cash Register'}
                        {view === 'movement' && (movementType === 'deposit' ? 'Add Deposit' : 'Add Withdrawal')}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {view === 'open' && (
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="opening-amount">Opening Amount (Cash in Drawer)</Label>
                                    <Input
                                        id="opening-amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleOpenRegister}>Open Register</Button>
                                </DialogFooter>
                            </div>
                        )}

                        {view === 'details' && session && (
                            <div className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-gray-500">Opening Amount</span>
                                        <span className="font-medium">{formatCurrency(openingAmount)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-gray-500">Total Sales</span>
                                        <span className="font-medium">{formatCurrency(salesTotal)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-gray-500">Cash Sales</span>
                                        <span className="font-medium">{formatCurrency(cashSales)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-gray-500">Deposits</span>
                                        <span className="font-medium text-green-600">+{formatCurrency(deposits)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-gray-500">Withdrawals</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(withdrawals)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 bg-gray-100 px-2 rounded font-bold">
                                        <span>Total Cash in Drawer</span>
                                        <span>{formatCurrency(totalCash)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-between">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setMovementType('deposit'); setView('movement'); setAmount(''); setNotes('') }}
                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Deposit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setMovementType('withdrawal'); setView('movement'); setAmount(''); setNotes('') }}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <Minus className="h-4 w-4 mr-1" /> Withdraw
                                        </Button>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => { setView('close'); setAmount('') }}>
                                        Close Register
                                    </Button>
                                </div>
                            </div>
                        )}

                        {view === 'movement' && (
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mov-amount">Amount</Label>
                                    <Input
                                        id="mov-amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mov-notes">Notes / Reason</Label>
                                    <Input
                                        id="mov-notes"
                                        placeholder="e.g. Petty cash for office supplies"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="ghost" onClick={() => setView('details')}>Cancel</Button>
                                    <Button onClick={handleMovement}>Confirm {movementType === 'deposit' ? 'Deposit' : 'Withdrawal'}</Button>
                                </DialogFooter>
                            </div>
                        )}

                        {view === 'close' && (
                            <div className="space-y-4 py-2">
                                <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto" />
                                <p className="text-center text-sm text-gray-600">
                                    Please count the cash in the drawer and enter the total amount below.
                                </p>
                                <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-500">Expected Cash:</span>
                                        <span className="font-medium">{formatCurrency(totalCash)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="closing-amount">Actual Cash Amount</Label>
                                    <Input
                                        id="closing-amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                {amount && (
                                    <div className={`text-sm text-center font-medium ${Number(amount) - totalCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        Difference: {formatCurrency(Number(amount) - totalCash)}
                                    </div>
                                )}
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="ghost" onClick={() => setView('details')}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleCloseRegister}>Confirm Close</Button>
                                </DialogFooter>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
