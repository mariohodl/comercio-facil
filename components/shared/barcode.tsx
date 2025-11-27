'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
    value: string
    format?: 'CODE128' | 'CODE39' | 'EAN13'
    width?: number
    height?: number
    displayValue?: boolean
}

export default function Barcode({
    value,
    format = 'CODE128',
    width = 2,
    height = 100,
    displayValue = true,
}: BarcodeProps) {
    const canvasRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (canvasRef.current && value) {
            try {
                JsBarcode(canvasRef.current, value, {
                    format,
                    width,
                    height,
                    displayValue,
                })
            } catch (error) {
                console.error('Error generating barcode:', error)
            }
        }
    }, [value, format, width, height, displayValue])

    return <svg ref={canvasRef} />
}
