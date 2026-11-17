'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import EmailVerificationStep from '@/components/EmailVerificationStep'
import { ApiValidationError, type PendingVerification } from '@/utils/Types/auth'
import { translateAuthError } from '@/utils/helpers'

/** API field name -> this form's field. */
const FORM_FIELDS = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  password: 'password',
  password_confirmation: 'confirmPassword',
} as const

export default function RegisterPage() {
  const { t, lang, dir } = useLanguage()
  const isRtl = dir === 'rtl'
  // Icon side follows the UI language, not each field's own ltr text
  // direction (email/phone/password stay ltr for readable typing either way).
  const iconSide = isRtl ? 'right-3' : 'left-3'
  const toggleSide = isRtl ? 'left-3' : 'right-3'
  const fieldPadding = isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
  const [showPassword, setShowPassword] = useState(false)
  // Set once the account is created and a code was emailed: the card switches
  // to the code screen, and a correct code signs the customer straight in.
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null)
  const { register: authRegister } = useAuth()

  const registerSchema = z.object({
    name: z.string().min(3, t('auth.nameMinLength')),
    email: z.string().email(t('auth.invalidEmail')),
    phone: z.string().min(10, t('auth.invalidPhone')).regex(/^[0-9]+$/, t('auth.numbersOnly')),
    // Same minimum as the API (min:8), so it is caught here, not after a round trip.
    password: z.string().min(8, t('auth.passwordMin8')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordsMismatch'),
    path: ['confirmPassword'],
  })
  type RegisterForm = z.infer<typeof registerSchema>

  // The form keeps its values while the code screen is up, so "edit details"
  // brings the customer back to what they typed rather than an empty form.
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    shouldUnregister: false,
  })

  // The API answers in English whatever the UI language ("The phone has
  // already been taken."), so known cases get our own wording.
  const apiFieldMessage = (field: string, raw: string): string => {
    const lower = raw.toLowerCase()
    const taken = lower.includes('taken') || lower.includes('already') || /مسجل|مستخدم|موجود/.test(raw)
    if (field === 'phone') {
      if (taken) return t('auth.phoneTaken')
      return lower.includes('number') ? t('auth.numbersOnly') : t('auth.invalidPhone')
    }
    if (field === 'email') return taken ? t('auth.emailTaken') : t('auth.invalidEmail')
    if (field === 'password' || field === 'password_confirmation') {
      if (lower.includes('match') || lower.includes('same') || /تطابق/.test(raw)) return t('auth.passwordsMismatch')
      if (lower.includes('at least') || /8/.test(raw)) return t('auth.passwordMin8')
    }
    return lang === 'en' ? raw : translateAuthError(raw)
  }

  // Each rejected field gets its message under its own input, and the first
  // one is also toasted so it is seen even when that input is scrolled away.
  const showApiFieldErrors = (fields: Record<string, string>) => {
    let first: string | null = null
    for (const [apiField, raw] of Object.entries(fields)) {
      const message = apiFieldMessage(apiField, raw)
      const formField = FORM_FIELDS[apiField as keyof typeof FORM_FIELDS]
      if (formField) setError(formField, { type: 'server', message }, { shouldFocus: first === null })
      first ??= message
    }
    if (first) toast.error(first)
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      const pending = await authRegister(data.name, data.email, data.phone, data.password)
      if (pending.emailSent) toast.success(t('auth.accountCreatedCheckEmail'))
      setPendingVerification(pending)
    } catch (error: any) {
      if (error instanceof ApiValidationError) {
        showApiFieldErrors(error.fields)
        return
      }
      toast.error(error.message || t('auth.registerFailed'))
    }
  }

  const onVerified = () => {
    toast.success(t('auth.welcomeAboard'))
    window.location.href = '/'
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
          <div className="flex justify-center mb-4">
            <div className="bg-dark rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">TIX</span>
            </div>
          </div>
          <p className="text-text-muted">{t('auth.registerSubtitle')}</p>
        </div>

        <div className="card p-6 md:p-8">
          {pendingVerification && (
            <EmailVerificationStep
              pending={pendingVerification}
              onVerified={onVerified}
              onBack={() => setPendingVerification(null)}
            />
          )}
          <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${pendingVerification ? 'hidden' : ''}`}>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.type}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className={`input-field ${fieldPadding}`}
                    dir={field.dir}
                  />
                  <field.icon className={`absolute ${iconSide} top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint`} />
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
                  className="input-field pl-10 pr-10"
                  dir="ltr"
                />
                <Lock className={`absolute ${iconSide} top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${toggleSide} top-1/2 -translate-y-1/2 text-text-faint`}
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
                  className={`input-field ${fieldPadding}`}
                  dir="ltr"
                />
                <Lock className={`absolute ${iconSide} top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint`} />
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
              <Link href="/login" className="text-error hover:underline font-medium">
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
