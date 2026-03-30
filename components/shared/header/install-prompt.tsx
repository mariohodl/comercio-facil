'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InstallPromptProps {
  variant?: 'icon' | 'menuItem' | 'button'
  className?: string
}

export function InstallPrompt({ variant = 'icon', className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI notify the user they can install the PWA
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      // Log install to analytics
      console.log('PWA instalada con éxito')
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null)
      setIsInstallable(false)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
  }

  // If the app is not installable or already installed, don't show anything
  if (!isInstallable || isInstalled) return null

  if (variant === 'menuItem') {
    return (
      <button 
        onClick={handleInstallClick}
        className={cn(
          "w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/50 transition-colors bg-white rounded-2xl shadow-sm border border-gray-100/80 text-left cursor-pointer group",
          className
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors flex items-center justify-center">
          <Download className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-gray-800 block">Instalar Aplicación</span>
          <span className="text-[11px] font-medium text-gray-400 block mt-0.5 uppercase tracking-wide">Acceso Rápido</span>
        </div>
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <Button 
        onClick={handleInstallClick}
        variant="outline"
        className={cn("gap-2 border-orange-200 bg-orange-50/50 text-orange-600 hover:bg-orange-100/50 hover:text-orange-700", className)}
      >
        <Smartphone className="w-4 h-4" />
        Instalar App
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={handleInstallClick}
      className={cn("p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 h-auto", className)}
      title="Instalar Aplicación"
    >
      <Download className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-medium ml-2">Instalar App</span>
    </Button>
  )
}
