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

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      toast.success('تم تسجيل الدخول بنجاح')
      window.location.href = redirectPath
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="email@example.com"
              className="input-field text-sm pr-4 pl-10 focus:border-dark focus:shadow-none"
              dir="ltr"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="input-field text-sm pr-10 pl-10 focus:border-dark focus:shadow-none"
              dir="ltr"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-muted cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-dark" />
            تذكرني
          </label>
          <Link href="/forgot-password" className="text-sm text-dark hover:underline">
            نسيت كلمة المرور؟
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
              تسجيل الدخول
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-divider" />
        <span className="text-xs text-text-muted">أو</span>
        <div className="flex-1 h-px bg-divider" />
      </div>

      <p className="text-center text-text-muted mt-8">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-dark hover:underline font-semibold inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg" dir="rtl">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-dark rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">TIX</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">تسجيل الدخول</h1>
          <p className="text-center text-text-muted mb-6">أدخل بيانات حسابك للمتابعة</p>

          <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
