'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Barcode Scanner Hook
 * 
 * Detects hardware barcode scanner input and prevents characters from entering wrong fields.
 * Only the first character may briefly appear in a focused field before being cleaned up.
 */
export function useBarcodeScanner(
    onScan: (barcode: string) => void,
    active: boolean = true,
    latency: number = 50
) {
    const bufferRef = useRef<string>('')
    const lastKeyTimeRef = useRef<number>(0)
    const scanModeRef = useRef<boolean>(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const onScanRef = useRef(onScan)
    onScanRef.current = onScan

    const resetState = useCallback(() => {
        bufferRef.current = ''
        lastKeyTimeRef.current = 0
        scanModeRef.current = false
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.ctrlKey || event.altKey || event.metaKey) return

        const activeEl = document.activeElement

        // By default, we intercept scans globally (body, divs, etc.).
        // However, for INPUT and TEXTAREA, we ignore them by default to avoid "eating" fast human typing.
        // We only intercept in these fields if they explicitly have the 'data-barcode-capture' attribute.
        const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement
        const isCaptured = activeEl?.hasAttribute('data-barcode-capture')
        const shouldIgnore = isInput && !isCaptured

        const currentTime = Date.now()
        const timeSinceLastKey = lastKeyTimeRef.current > 0 ? currentTime - lastKeyTimeRef.current : 0

        // === ENTER/TAB - Scan completion ===
        if (event.key === 'Enter' || event.key === 'Tab') {
            if (scanModeRef.current) {
                // ALWAYS block Enter/Tab if we were in scan mode to prevent form submission
                event.preventDefault()
                event.stopImmediatePropagation()

                const barcode = bufferRef.current.trim()
                // Require at least 2 characters to consider it a valid barcode
                if (barcode.length >= 2) {
                    onScanRef.current(barcode)
                }
                resetState()
                return
            }

            resetState()
            return
        }

        // Only process single printable characters
        if (event.key.length !== 1) return

        // If ignored, stop here to avoid detecting fast typing as a scan
        if (shouldIgnore) {
            resetState()
            return
        }

        // Reset if too much time passed (human typing)
        // We use 300ms to be very safe for mobile Bluetooth scanners which can be "bursty"
        if (timeSinceLastKey > 300 && bufferRef.current.length > 0) {
            resetState()
        }

        // === FIRST CHARACTER ===
        if (bufferRef.current.length === 0) {
            bufferRef.current = event.key
            lastKeyTimeRef.current = currentTime
            return
        }

        // === SECOND+ CHARACTER - Scanner Detection ===
        // Hardware scanners typically send keys with < 50ms latency.
        // But mobile Bluetooth scanners or busy CPUs can gap up to 100-150ms.
        if (timeSinceLastKey < latency) {
            if (!scanModeRef.current) {
                scanModeRef.current = true

                if (isInput) {
                    const val = (activeEl as HTMLInputElement).value
                    const lastChar = bufferRef.current
                    if (val.length > 0 && val.endsWith(lastChar)) {
                        (activeEl as HTMLInputElement).value = val.slice(0, -lastChar.length)
                        activeEl.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                }
            }

            event.preventDefault()
            event.stopImmediatePropagation()

            bufferRef.current += event.key
            lastKeyTimeRef.current = currentTime

            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                const barcode = bufferRef.current.trim()
                if (barcode.length >= 2 && scanModeRef.current) {
                    onScanRef.current(barcode)
                }
                resetState()
            }, Math.max(latency * 2, 250))

            return
        }

        resetState()
    }, [resetState, latency])

    useEffect(() => {
        if (!active) return

        window.addEventListener('keydown', handleKeyDown, true)

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true)
            resetState()
        }
    }, [active, handleKeyDown, resetState])
}
