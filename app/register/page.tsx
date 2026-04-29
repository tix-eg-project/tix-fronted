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

const registerSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح').regex(/^[0-9]+$/, 'أرقام فقط'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { register: authRegister } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data.name, data.email, data.phone, data.password)
      toast.success('تم إنشاء الحساب بنجاح')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الحساب')
    }
  }

  const fields = [
    { name: 'name' as const, label: 'الاسم الكامل', icon: User, type: 'text', placeholder: 'محمد أحمد', dir: 'rtl' },
    { name: 'email' as const, label: 'البريد الإلكتروني', icon: Mail, type: 'email', placeholder: 'email@example.com', dir: 'ltr' },
    { name: 'phone' as const, label: 'رقم الهاتف', icon: Phone, type: 'tel', placeholder: '01xxxxxxxxx', dir: 'ltr' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TIX</h1>
          <p className="text-text-muted">أنشئ حسابك الجديد</p>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.type}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className="input-field pr-4 pl-10"
                    dir={field.dir}
                  />
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
                </div>
                {errors[field.name] && (
                  <p className="text-error text-xs mt-1">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}

            {/* Password */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="input-field pr-4 pl-10"
                  dir="ltr"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
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
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
