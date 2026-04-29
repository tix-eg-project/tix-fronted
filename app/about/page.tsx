import type { Metadata } from 'next'
import { Users, Target, Award, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'تعرف على منصة TIX للتجارة الإلكترونية في مصر',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="section-title text-center mb-4">من نحن</h1>
      <p className="text-center text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
        TIX هي منصة تجارة إلكترونية مصرية تهدف إلى تقديم أفضل تجربة تسوق عبر الإنترنت لعملائنا في جميع أنحاء مصر.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {[
          { icon: Target, title: 'رؤيتنا', desc: 'أن نكون المنصة الأولى للتسوق الإلكتروني في مصر.' },
          { icon: Award, title: 'مهمتنا', desc: 'توفير منتجات عالية الجودة بأسعار تنافسية مع خدمة توصيل ممتازة.' },
          { icon: Users, title: 'فريقنا', desc: 'فريق شاب ومتحمس يعمل لتحسين تجربة التسوق الإلكتروني يومياً.' },
          { icon: Globe, title: 'تغطيتنا', desc: 'نوصل لجميع محافظات مصر خلال 2-5 أيام عمل.' },
        ].map((item) => (
          <div key={item.title} className="card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-light rounded-xl flex items-center justify-center text-primary">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
