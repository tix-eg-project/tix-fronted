'use client'
import { useGoogleOneTapLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'react-toastify'
interface Props {
  redirectTo?: string
}

export default function GoogleOneTap({ redirectTo = '/' }: Props) {
  const { loginWithGoogle, state } = useAuth()
  const { t } = useLanguage()

  useGoogleOneTapLogin({
    disabled: state.isAuthenticated,
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse.credential) return
      try {
        await loginWithGoogle(credentialResponse.credential)
        toast.success(t('auth.loginSuccess'))
        window.location.href = redirectTo
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : t('auth.googleLoginFailed')
        toast.error(message)
      }
    },
    onError: () => toast.error(t('auth.googleLoginFailed')),
  })

  return null
}
