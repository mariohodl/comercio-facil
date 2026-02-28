'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const SocialButton = ({
  id,
  icon: Icon,
  provider,
  bgColor,
  hoverColor,
  textColor = "text-white",
  borderColor = "border-gray-100"
}: {
  id: string,
  icon: any,
  provider: string,
  bgColor: string,
  hoverColor: string,
  textColor?: string,
  borderColor?: string
}) => {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try {
      // Use client-side signIn for better PWA compatibility
      await signIn(id)
    } catch (error) {
      console.error('Social sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      disabled={loading}
      onClick={handleSignIn}
      className={`flex-1 h-11 shadow-sm flex items-center justify-center gap-3 ${bgColor} ${hoverColor} ${textColor} border ${borderColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 font-bold text-base group relative overflow-hidden rounded-xl`}
    >
      <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
        {typeof Icon === 'function' ? <Icon /> : Icon}
      </span>
      <span className="relative z-10 font-bold">
        {loading ? '...' : provider}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
    </Button>
  )
}

const SocialAuth = () => {
  const searchParams = useSearchParams()
  const promoCode = searchParams.get('promo')

  useEffect(() => {
    if (promoCode) {
      document.cookie = `promo_code=${promoCode}; path=/; max-age=3600`
    }

    if (window.location.hash === '#_=_') {
      history.replaceState
        ? history.replaceState(null, '', window.location.href.split('#')[0])
        : (window.location.hash = '')
    }

    // Auto-recovery for Brave browser PKCE issue:
    // When OAuth callback fails (pkceCodeVerifier not parsed),
    // Auth.js redirects back to sign-in with ?error=OAuthCallbackError.
    // We detect this and auto-reload once, which clears the error state
    // and lets the user try again with a fresh PKCE cookie.
    const hasOAuthError = searchParams.get('error')
    const alreadyRetried = sessionStorage.getItem('oauth_retry')

    if (hasOAuthError && !alreadyRetried) {
      sessionStorage.setItem('oauth_retry', '1')
      // Small delay so the page renders before navigating cleanly
      setTimeout(() => {
        window.location.replace(window.location.pathname)
      }, 150)
    } else if (!hasOAuthError) {
      // Clean retry flag when no error present
      sessionStorage.removeItem('oauth_retry')
    }
  }, [promoCode, searchParams])

  return (
    <div className='flex flex-col sm:flex-row gap-3 w-full'>
      <SocialButton
        id="google"
        icon={GoogleIcon}
        provider="Google"
        bgColor="bg-white"
        hoverColor="hover:bg-slate-50"
        textColor="text-slate-700"
        borderColor="border-slate-300 shadow-sm hover:shadow-md hover:border-slate-400"
      />
    </div>
  )
}

export default SocialAuth