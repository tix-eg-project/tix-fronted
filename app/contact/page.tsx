import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق TIX للمساعدة والدعم الفني',
}

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
      <h1 className="section-title text-center mb-4">تواصل معنا</h1>
      <p className="text-center text-text-muted mb-10">نسعد بتواصلك معنا. أرسل لنا رسالتك وسنرد في أقرب وقت.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: Phone, title: 'الهاتف', value: '+20 123 456 7890', href: 'tel:+201234567890' },
          { icon: Mail, title: 'البريد', value: 'info@tix-eg.com', href: 'mailto:info@tix-eg.com' },
          { icon: MapPin, title: 'العنوان', value: 'الزقازيق، الشرقية، مصر', href: '#' },
        ].map((item) => (
          <a key={item.title} href={item.href} className="card p-5 text-center hover:border-primary/30 transition-colors">
            <item.icon className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-bold text-sm mb-1">{item.title}</h3>
            <p className="text-text-muted text-sm" dir="ltr">{item.value}</p>
          </a>
        ))}
      </div>

      <div className="card p-6 md:p-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          أرسل لنا رسالة
        </h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">الاسم</label>
              <input type="text" className="input-field" placeholder="اسمك الكامل" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
              <input type="email" className="input-field" placeholder="email@example.com" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">الموضوع</label>
            <input type="text" className="input-field" placeholder="موضوع الرسالة" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">الرسالة</label>
            <textarea className="input-field !py-2" rows={5} placeholder="اكتب رسالتك هنا..." />
          </div>
          <button type="submit" className="btn-primary">إرسال الرسالة</button>
        </form>
      </div>
    </div>
  )
}
