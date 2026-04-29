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
      router.push(redirectPath)
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول')
    }
  }

  return (
    <div className="card p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="email@example.com"
              className="input-field pr-4 pl-10"
              dir="ltr"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="input-field pr-10 pl-10"
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
            <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
            تذكرني
          </label>
          <Link href="/forgot-password" className="text-primary hover:underline text-sm">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-divider" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-4 text-sm text-text-muted">أو</span>
        </div>
      </div>

      <Link
        href="/register"
        className="btn-outline w-full text-center flex items-center justify-center gap-2 !py-3"
      >
        <UserPlus className="w-5 h-5" />
        إنشاء حساب جديد
      </Link>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TIX</h1>
          <p className="text-text-muted">سجّل الدخول لحسابك</p>
        </div>
        <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
