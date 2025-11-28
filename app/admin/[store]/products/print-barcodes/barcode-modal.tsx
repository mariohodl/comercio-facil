'use client'

import { useEffect, useRef } from 'react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, X } from 'lucide-react'
import { IProduct } from '@/lib/db/models/product.model'
import JsBarcode from 'jsbarcode'
import { formatCurrency } from '@/lib/utils'

interface BarcodeModalProps {
    isOpen: boolean
    onClose: () => void
    products: { product: IProduct; quantity: number }[]
    config: {
        paperSize: string
        storeName: string
        showStoreName: boolean
        showProductName: boolean
        showPrice: boolean
    }
}

// Dedicated Barcode Component to handle generation reliably
const Barcode = ({ value, className }: { value: string, className?: string }) => {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (svgRef.current) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: "CODE128",
                    width: 2.5,
                    height: 60,
                    displayValue: true,
                    fontSize: 14,
                    margin: 5,
                    textMargin: 3,
                    background: "#ffffff",
                    lineColor: "#000000"
                })
            } catch (e) {
                console.error('Error generating barcode', e)
            }
        }
    }, [value])

    return <svg ref={svgRef} className={className} />
}

export default function BarcodeModal({
    isOpen,
    onClose,
    products,
    config
}: BarcodeModalProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printRef.current
        if (!content) return

        const printWindow = window.open('', '', 'height=600,width=800')
        if (!printWindow) return

        printWindow.document.write('<html><head><title>Print Barcodes</title>')
        printWindow.document.write('<style>')
        printWindow.document.write(`
            @media print {
                body { margin: 0; padding: 15px; font-family: system-ui, -apple-system, sans-serif; }
                .product-section { margin-bottom: 20px; page-break-inside: avoid; }
                .product-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1e3a8a; }
                .barcode-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 16px; 
                }
                .barcode-card { 
                    border: 1px solid #e5e7eb; 
                    padding: 16px; 
                    text-align: center; 
                    border-radius: 8px;
                    page-break-inside: avoid;
                    background: white;
                }
                .store-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111827; }
                .product-name { font-size: 13px; margin-bottom: 4px; color: #6b7280; }
                .price { font-size: 14px; margin-bottom: 8px; color: #111827; }
                svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            }
        `)
        printWindow.document.write('</style></head><body>')
        printWindow.document.write(content.innerHTML)
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[800px] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Barcode</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Print Button */}
                <div className="px-6 py-3 flex justify-end">
                    <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Barcode
                    </Button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-6" ref={printRef}>
                    {products.map(({ product, quantity }) => (
                        <div key={product._id} className="product-section">
                            <h3 className="text-base font-bold mb-3 product-title text-[#1e3a8a]">
                                {product.name}
                            </h3>
                            <div className="grid grid-cols-3 gap-4 barcode-grid">
                                {Array(quantity).fill(product).map((_, idx) => (
                                    <div
                                        key={`${product._id}-${idx}`}
                                        className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-white barcode-card"
                                    >
                                        {config.showStoreName && (
                                            <div className="font-bold text-gray-900 mb-1 text-sm store-name">
                                                {config.storeName}
                                            </div>
                                        )}
                                        {config.showProductName && (
                                            <div className="text-gray-500 mb-1 text-xs product-name">
                                                {product.name}
                                            </div>
                                        )}
                                        {config.showPrice && (
                                            <div className="text-sm mb-2 text-gray-900 price">
                                                Price: {formatCurrency(product.price)}
                                            </div>
                                        )}
                                        <Barcode
                                            value={product.itemBarcode}
                                            className="w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
