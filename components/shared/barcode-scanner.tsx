'use client'

import { useState, useEffect } from 'react'
import { useZxing } from 'react-zxing'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BarcodeScannerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onScan: (result: string) => void
}

interface ScannerProps {
    onScan: (result: string) => void
    onError: (error: unknown) => void
}

function Scanner({ onScan, onError }: ScannerProps) {
    const { ref } = useZxing({
        constraints: {
            video: {
                facingMode: 'environment',
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
            }
        },
        timeBetweenDecodingAttempts: 50, // Scan more frequently
        onDecodeResult(result) {
            console.log('Decoded:', result.getText())
            onScan(result.getText())
        },
        onError(error) {
            onError(error)
        },
    })

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video ref={ref} className="w-full h-full object-cover" autoPlay playsInline muted />
            <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80 -translate-y-1/2" />
            </div>
        </div>
    )
}

export default function BarcodeScannerDialog({
    open,
    onOpenChange,
    onScan,
}: BarcodeScannerDialogProps) {
    const [error, setError] = useState<string | null>(null)
    const [cameraAvailable, setCameraAvailable] = useState<boolean>(true)

    // Check if camera API is available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
            setCameraAvailable(hasCamera)
            if (!hasCamera) {
                setError('Camera not available. Please use HTTPS or check browser permissions.')
            }
        }
    }, [])

    const handleScan = (result: string) => {
        onScan(result)
        onOpenChange(false)
    }

    const handleError = (error: unknown) => {
        console.error('Scanner error:', error)
        if (error instanceof Error) {
            if (error.message.includes('Permission denied')) {
                setError('Camera permission denied. Please allow camera access in your browser settings.')
            } else if (error.message.includes('not supported')) {
                setError('Camera not supported. Please use HTTPS or try a different browser.')
            } else {
                setError(error.message)
            }
        } else {
            setError('Camera error. Please ensure you are using HTTPS and have granted camera permissions.')
        }
    }

    // Reset error when dialog opens
    if (!open && error && cameraAvailable) {
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                    <DialogDescription>
                        Point your camera at a barcode to scan it.
                    </DialogDescription>
                    <div className="text-xs text-muted-foreground space-y-1 pt-2">
                        <p className="font-medium">Tips for curved barcodes:</p>
                        <ul className="list-disc list-inside space-y-0.5 pl-2">
                            <li>Angle the item to flatten the barcode surface</li>
                            <li>Try different distances (8-15 inches works best)</li>
                            <li>Ensure bright, even lighting without glare</li>
                            <li>Hold steady and wait - scanner tries continuously</li>
                        </ul>
                    </div>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-4">
                    {open && cameraAvailable && (
                        <Scanner onScan={handleScan} onError={handleError} />
                    )}
                    {!cameraAvailable && (
                        <div className="w-full p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                                Camera access requires HTTPS. Please access this site via HTTPS or use manual barcode entry.
                            </p>
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {cameraAvailable ? 'Cancel' : 'Close'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
