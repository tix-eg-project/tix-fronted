import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'الشروط والأحكام' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="section-title mb-6">الشروط والأحكام</h1>
      <div className="card p-6 md:p-8 prose prose-sm max-w-none text-text-muted leading-relaxed space-y-4">
        <p>مرحباً بك في منصة TIX للتجارة الإلكترونية. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
        <h3 className="text-text font-bold">1. الاستخدام العام</h3>
        <p>يجب أن تكون 18 عاماً على الأقل لاستخدام هذا الموقع. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك.</p>
        <h3 className="text-text font-bold">2. الطلبات والمدفوعات</h3>
        <p>جميع الأسعار المعروضة بالجنيه المصري (EGP) وتشمل الضرائب المطبقة. نحتفظ بالحق في تعديل الأسعار دون إشعار مسبق.</p>
        <h3 className="text-text font-bold">3. الشحن والتوصيل</h3>
        <p>نسعى لتوصيل الطلبات خلال 2-5 أيام عمل لجميع المحافظات. أوقات التوصيل قد تتغير في المواسم والعطلات.</p>
        <h3 className="text-text font-bold">4. الضمان</h3>
        <p>جميع المنتجات المعروضة أصلية ومغطاة بضمان المصنع حيث ينطبق.</p>
      </div>
    </div>
  )
}
