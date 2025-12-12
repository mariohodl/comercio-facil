'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface CalculatorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
    const [display, setDisplay] = useState('0')
    const [previousValue, setPreviousValue] = useState<number | null>(null)
    const [operation, setOperation] = useState<string | null>(null)
    const [shouldResetDisplay, setShouldResetDisplay] = useState(false)
    const t = useTranslations('pos')

    const handleNumber = (num: string) => {
        if (shouldResetDisplay) {
            setDisplay(num)
            setShouldResetDisplay(false)
        } else {
            setDisplay(display === '0' ? num : display + num)
        }
    }

    const handleOperation = (op: string) => {
        const currentValue = parseFloat(display)

        if (previousValue !== null && operation && !shouldResetDisplay) {
            const result = calculate(previousValue, currentValue, operation)
            setDisplay(String(result))
            setPreviousValue(result)
        } else {
            setPreviousValue(currentValue)
        }

        setOperation(op)
        setShouldResetDisplay(true)
    }

    const calculate = (a: number, b: number, op: string): number => {
        switch (op) {
            case '+': return a + b
            case '-': return a - b
            case '×': return a * b
            case '÷': return b !== 0 ? a / b : 0
            case '%': return a * (b / 100)
            default: return b
        }
    }

    const handleEquals = () => {
        if (previousValue !== null && operation) {
            const result = calculate(previousValue, parseFloat(display), operation)
            setDisplay(String(result))
            setPreviousValue(null)
            setOperation(null)
            setShouldResetDisplay(true)
        }
    }

    const handleClear = () => {
        setDisplay('0')
        setPreviousValue(null)
        setOperation(null)
        setShouldResetDisplay(false)
    }

    const handleDecimal = () => {
        if (shouldResetDisplay) {
            setDisplay('0.')
            setShouldResetDisplay(false)
        } else if (!display.includes('.')) {
            setDisplay(display + '.')
        }
    }

    const handleBackspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1))
        } else {
            setDisplay('0')
        }
    }

    const NumberButton = ({ value, onClick }: { value: string; onClick: () => void }) => (
        <Button
            variant="ghost"
            className="h-14 text-xl font-semibold hover:bg-gray-100 rounded-2xl"
            onClick={onClick}
        >
            {value}
        </Button>
    )

    const OperationButton = ({ value, onClick, variant = 'secondary' }: { value: string; onClick: () => void; variant?: 'secondary' | 'primary' }) => (
        <Button
            variant="ghost"
            className={`h-14 text-xl font-semibold rounded-full ${variant === 'primary'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            onClick={onClick}
        >
            {value}
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 gap-0">
                <DialogHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">{t('calculator')}</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6">
                    {/* Display */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                        <div className="text-right text-5xl font-bold text-gray-700 overflow-hidden text-ellipsis">
                            {display}
                        </div>
                    </div>

                    {/* Calculator Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {/* Row 1 */}
                        <OperationButton value="C" onClick={handleClear} variant="primary" />
                        <OperationButton value="÷" onClick={() => handleOperation('÷')} />
                        <OperationButton value="%" onClick={() => handleOperation('%')} />
                        <OperationButton value="⌫" onClick={handleBackspace} variant="primary" />

                        {/* Row 2 */}
                        <NumberButton value="7" onClick={() => handleNumber('7')} />
                        <NumberButton value="8" onClick={() => handleNumber('8')} />
                        <NumberButton value="9" onClick={() => handleNumber('9')} />
                        <OperationButton value="×" onClick={() => handleOperation('×')} />

                        {/* Row 3 */}
                        <NumberButton value="4" onClick={() => handleNumber('4')} />
                        <NumberButton value="5" onClick={() => handleNumber('5')} />
                        <NumberButton value="6" onClick={() => handleNumber('6')} />
                        <OperationButton value="-" onClick={() => handleOperation('-')} />

                        {/* Row 4 */}
                        <NumberButton value="1" onClick={() => handleNumber('1')} />
                        <NumberButton value="2" onClick={() => handleNumber('2')} />
                        <NumberButton value="3" onClick={() => handleNumber('3')} />
                        <OperationButton value="+" onClick={() => handleOperation('+')} />

                        {/* Row 5 */}
                        <NumberButton value="," onClick={handleDecimal} />
                        <NumberButton value="00" onClick={() => handleNumber('00')} />
                        <NumberButton value="." onClick={handleDecimal} />
                        <OperationButton value="=" onClick={handleEquals} variant="primary" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
