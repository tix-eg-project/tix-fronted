import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'سياسة الإرجاع' }

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="section-title mb-6">سياسة الإرجاع والاستبدال</h1>
      <div className="card p-6 md:p-8 prose prose-sm max-w-none text-text-muted leading-relaxed space-y-4">
        <p>نحرص على رضاك التام. إذا لم تكن راضياً عن أي منتج، يمكنك إرجاعه وفقاً للشروط التالية:</p>
        <h3 className="text-text font-bold">1. فترة الإرجاع</h3>
        <p>يمكنك إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون المنتج في حالته الأصلية.</p>
        <h3 className="text-text font-bold">2. شروط الإرجاع</h3>
        <p>يجب أن يكون المنتج غير مستخدم وفي عبوته الأصلية مع جميع الملحقات والفاتورة.</p>
        <h3 className="text-text font-bold">3. استرداد المبلغ</h3>
        <p>يتم استرداد المبلغ خلال 5-7 أيام عمل بعد استلام وفحص المنتج المرتجع.</p>
      </div>
    </div>
  )
}
