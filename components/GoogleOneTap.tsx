'use client'
import { useGoogleOneTapLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface Props {
  redirectTo?: string
}

export default function GoogleOneTap({ redirectTo = '/' }: Props) {
  const { loginWithGoogle, state } = useAuth()
  const router = useRouter()

  useGoogleOneTapLogin({
    disabled: state.isAuthenticated,
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse.credential) return
      try {
        await loginWithGoogle(credentialResponse.credential)
        toast.success('تم تسجيل الدخول بنجاح')
        router.push(redirectTo)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'فشل تسجيل الدخول بجوجل'
        toast.error(message)
      }
    },
    onError: () => toast.error('فشل تسجيل الدخول بجوجل'),
  })

  return null
}
