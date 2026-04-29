import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'سياسة الخصوصية' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="section-title mb-6">سياسة الخصوصية</h1>
      <div className="card p-6 md:p-8 prose prose-sm max-w-none text-text-muted leading-relaxed space-y-4">
        <p>نحن في TIX نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
        <h3 className="text-text font-bold">1. البيانات التي نجمعها</h3>
        <p>نجمع البيانات اللازمة لمعالجة طلباتك: الاسم، البريد الإلكتروني، رقم الهاتف، عنوان التوصيل.</p>
        <h3 className="text-text font-bold">2. استخدام البيانات</h3>
        <p>تُستخدم بياناتك لمعالجة الطلبات وتحسين تجربة التسوق. لا نشارك بياناتك مع أطراف ثالثة إلا لأغراض التوصيل والدفع.</p>
        <h3 className="text-text font-bold">3. أمان البيانات</h3>
        <p>نستخدم تقنيات تشفير متقدمة لحماية بياناتك المالية والشخصية.</p>
      </div>
    </div>
  )
}
