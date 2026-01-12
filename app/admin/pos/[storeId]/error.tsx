'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('POS Error:', error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center gap-4">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
                    <p className="text-center text-gray-600">
                        An error occurred in the POS system. Please try again.
                    </p>
                    {error.message && (
                        <p className="text-sm text-gray-500 text-center">
                            Error: {error.message}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full"
                        size="lg"
                    >
                        Try again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/admin/dashboard'}
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}
