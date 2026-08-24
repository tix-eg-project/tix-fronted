'use client'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'react-toastify'
import { useState } from 'react'

interface Props {
  onSuccess?: () => void
}

export default function GoogleAuthButton({ onSuccess }: Props) {
  const { loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credential: string) => {
    setLoading(true)
    try {
      await loginWithGoogle(credential)
      toast.success(t('auth.loginSuccess'))
      if (onSuccess) {
        // full reload ensures cookie is sent with the next request (fixes Mac/Safari)
        setTimeout(() => { onSuccess() }, 100)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.googleLoginFailed')
      toast.error(message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-11 rounded-lg border border-border bg-white flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center [&>div]:w-full [&_iframe]:w-full">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            handleSuccess(credentialResponse.credential)
          }
        }}
        onError={() => toast.error(t('auth.googleLoginFailed'))}
        text="signin_with"
        shape="rectangular"
        size="large"
        width="400"
      />
    </div>
  )
}
