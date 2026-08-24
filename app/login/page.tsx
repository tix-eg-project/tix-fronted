'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import GoogleOneTap from '@/components/GoogleOneTap'

function LoginForm() {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMinLength')),
  })
  type LoginForm = z.infer<typeof loginSchema>

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      toast.success(t('auth.loginSuccess'))
      window.location.href = redirectPath
    } catch (error: any) {
      toast.error(error.message || t('auth.loginFailed'))
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border p-8">
      <GoogleOneTap />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">{t('auth.email')}</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="email@example.com"
              className="input-field text-sm ps-4 pe-10 focus:border-dark focus:shadow-none"
              dir="ltr"
            />
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('auth.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="input-field text-sm ps-10 pe-10 focus:border-dark focus:shadow-none"
              dir="ltr"
            />
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-muted cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-dark" />
            {t('auth.rememberMe')}
          </label>
          <Link href="/forgot-password" className="text-sm text-dark hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-lg bg-dark text-white hover:bg-dark-light transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              {t('auth.loginButton')}
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-divider" />
        <span className="text-xs text-text-muted">{t('auth.or')}</span>
        <div className="flex-1 h-px bg-divider" />
      </div>

      <GoogleAuthButton onSuccess={() => { window.location.href = '/' }} />

      <p className="text-center text-text-muted mt-8">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="text-dark hover:underline font-semibold inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          {t('auth.createAccount')}
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-dark rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">TIX</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-center text-text-muted mb-6">{t('auth.loginSubtitle')}</p>

          <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
