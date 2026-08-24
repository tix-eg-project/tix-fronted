'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import GoogleOneTap from '@/components/GoogleOneTap'

export default function RegisterPage() {
  const { t, dir } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const { register: authRegister } = useAuth()
  const router = useRouter()

  const registerSchema = z.object({
    name: z.string().min(3, t('auth.nameMinLength')),
    email: z.string().email(t('auth.invalidEmail')),
    phone: z.string().min(10, t('auth.invalidPhone')).regex(/^[0-9]+$/, t('auth.numbersOnly')),
    password: z.string().min(6, t('auth.passwordMinLength')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordsMismatch'),
    path: ['confirmPassword'],
  })
  type RegisterForm = z.infer<typeof registerSchema>

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data.name, data.email, data.phone, data.password)
      toast.success(t('auth.registerSuccess'))
      window.location.href = '/'
    } catch (error: any) {
      toast.error(error.message || t('auth.registerFailed'))
    }
  }

  const fields = [
    { name: 'name' as const, label: t('auth.fullName'), icon: User, type: 'text', placeholder: t('auth.fullNamePlaceholder'), dir },
    { name: 'email' as const, label: t('auth.email'), icon: Mail, type: 'email', placeholder: 'email@example.com', dir: 'ltr' as const },
    { name: 'phone' as const, label: t('auth.phone'), icon: Phone, type: 'tel', placeholder: '01xxxxxxxxx', dir: 'ltr' as const },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TIX</h1>
          <p className="text-text-muted">{t('auth.registerSubtitle')}</p>
        </div>

        <div className="card p-6 md:p-8">
          <GoogleOneTap />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.type}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className="input-field ps-4 pe-10"
                    dir={field.dir}
                  />
                  <field.icon className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
                </div>
                {errors[field.name] && (
                  <p className="text-error text-xs mt-1">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="input-field ps-10 pe-10"
                  dir="ltr"
                />
                <Lock className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-text-faint"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="input-field ps-4 pe-10"
                  dir="ltr"
                />
                <Lock className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
              </div>
              {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
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
                  <UserPlus className="w-5 h-5" />
                  {t('auth.createAccountButton')}
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 space-y-4">
            <p className="text-sm text-text-muted">
              {t('auth.haveAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('auth.loginButton')}
              </Link>
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-divider" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-4 text-sm text-text-muted">{t('auth.or')}</span>
              </div>
            </div>
            <GoogleAuthButton onSuccess={() => { window.location.href = '/' }} />
            <Link
              href="/vendor/register"
              className="w-full text-center flex items-center justify-center gap-2 !py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              <UserPlus className="w-5 h-5" />
              {t('auth.joinAsVendor')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
