'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import BarcodeScannerDialog from '@/components/shared/barcode-scanner'
import { usePOSStore } from '@/hooks/use-pos-store'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScanLine, Camera } from 'lucide-react'

interface POSBarcodeScannerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    storeId: string
}

export default function POSBarcodeScanner({ open, onOpenChange, storeId }: POSBarcodeScannerProps) {
    const [manualSKU, setManualSKU] = useState('')
    const [scanning, setScanning] = useState(false)
    const [cameraOpen, setCameraOpen] = useState(false)
    const { addToCart } = usePOSStore()
    const t = useTranslations('pos')

    const searchAndAddProduct = async (barcode: string) => {
        if (!barcode.trim()) return

        setScanning(true)
        try {
            // Search for product by barcode
            const result = await getAllProductsForAdmin({
                query: '',
                page: 1,
                limit: 1000, // Get more products to search through
                store: storeId,
            })

            // Find exact barcode match
            const product = result.products.find(p => {
                return p.itemBarcode === barcode
            })

            if (product) {
                addToCart(product)
                setManualSKU('')
                onOpenChange(false)
                // Show success feedback
                const successMsg = document.createElement('div')
                successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                successMsg.textContent = t('addedToCart', { product: product.name })
                document.body.appendChild(successMsg)
                setTimeout(() => successMsg.remove(), 2000)
            } else {
                alert(t('productNotFound', { sku: barcode }))
            }
        } catch (error) {
            console.error('Error searching product:', error)
            alert(t('errorSearching'))
        } finally {
            setScanning(false)
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        searchAndAddProduct(manualSKU)
    }

    const handleCameraScan = (result: string) => {
        setCameraOpen(false)
        searchAndAddProduct(result)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ScanLine className="h-5 w-5" />
                            {t('scanProduct')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Camera Scanner Button */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">{t('cameraScanner')}</Label>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50"
                                onClick={() => setCameraOpen(true)}
                            >
                                <Camera className="h-8 w-8 text-blue-600" />
                                <span className="text-sm font-medium">{t('openCameraToScan')}</span>
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                                {t('useCameraToScan')}
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">
                                    {t('orEnterManually')}
                                </span>
                            </div>
                        </div>

                        {/* Manual Entry */}
                        <div className="space-y-2">
                            <Label htmlFor="manual-sku" className="text-sm font-semibold">
                                {t('manualEntry')}
                            </Label>
                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                                <Input
                                    id="manual-sku"
                                    placeholder={t('enterSKU')}
                                    value={manualSKU}
                                    onChange={(e) => setManualSKU(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={scanning || !manualSKU.trim()}
                                >
                                    {scanning ? t('searching') : t('add')}
                                </Button>
                            </form>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false)
                                    setManualSKU('')
                                }}
                            >
                                {t('cancel')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Camera Scanner Modal */}
            <BarcodeScannerDialog
                open={cameraOpen}
                onOpenChange={setCameraOpen}
                onScan={handleCameraScan}
            />
        </>
    )
}
