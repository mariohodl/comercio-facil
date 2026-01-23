'use client'

import { useEffect, useRef } from 'react'


export function useBarcodeScanner(onScan: (barcode: string) => void, active: boolean = true) {
    const bufferRef = useRef<string>('')
    const lastKeyTimeRef = useRef<number>(0)
    const isScanningRef = useRef<boolean>(false)

    useEffect(() => {
        if (!active) return

        console.log('%c BARCODE SCANNER: Online & Listening ', 'background: #22c55e; color: #fff; font-weight: bold; border-radius: 4px; padding: 2px 5px;');

        const handleKeyDown = (event: KeyboardEvent) => {
            const currentTime = Date.now()
            const timeDiff = currentTime - lastKeyTimeRef.current

            const isFast = timeDiff > 0 && timeDiff < 65;

            if (isFast || isScanningRef.current) {
                event.preventDefault()
                event.stopImmediatePropagation()
                isScanningRef.current = true

                if (bufferRef.current.length === 1) {
                    const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement
                    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                        // Use a microtask to ensure we clear any value React just set
                        setTimeout(() => {
                            // Clear the entire input to prevent partial search matches
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                                window.HTMLInputElement.prototype, "value"
                            )?.set || Object.getOwnPropertyDescriptor(
                                window.HTMLTextAreaElement.prototype, "value"
                            )?.set;

                            nativeInputValueSetter?.call(el, "");
                            el.dispatchEvent(new Event('input', { bubbles: true }))
                            el.dispatchEvent(new Event('change', { bubbles: true }))
                        }, 0)
                    }
                }
            }

            if (event.key === 'Enter') {
                if (bufferRef.current.length > 2) {
                    event.preventDefault()
                    event.stopImmediatePropagation()

                    const barcode = bufferRef.current
                    console.log('%c SCAN CAPTURED ', 'background: #3b82f6; color: #fff; font-weight: bold; border-radius: 4px; padding: 2px 5px;', barcode);

                    onScan(barcode)
                }
                // Reset state
                bufferRef.current = ''
                isScanningRef.current = false
                lastKeyTimeRef.current = 0
                return
            }

            if (event.key.length > 1) return

            // if it's been too long, it's a new interaction (human or new scan)
            if (timeDiff > 100) {
                bufferRef.current = ''
                isScanningRef.current = false
            }

            bufferRef.current += event.key
            lastKeyTimeRef.current = currentTime
        }

        // Use capture phase (true) to intercept before React components see the event
        window.addEventListener('keydown', handleKeyDown, true)

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true)
            console.log('%c BARCODE SCANNER: Disconnected ', 'background: #ef4444; color: #fff; font-weight: bold; border-radius: 4px; padding: 2px 5px;');
        }
    }, [onScan, active])
}
