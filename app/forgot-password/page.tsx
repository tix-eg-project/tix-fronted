import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'نسيت كلمة المرور' }

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TIX</h1>
          <p className="text-text-muted">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
        </div>
        <div className="card p-6 md:p-8">
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
              <input type="email" className="input-field" placeholder="email@example.com" dir="ltr" />
            </div>
            <button type="submit" className="btn-primary w-full !py-3.5">إرسال رابط إعادة التعيين</button>
          </form>
        </div>
      </div>
    </div>
  )
}
