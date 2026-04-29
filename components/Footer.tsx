'use client'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#FF8C00', color: '#FFFFFF', padding: '30px 0', marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 40 }}>
          {/* About TIX */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#FFFFFF' }}>TIX</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
              منصة TIX هي وجهتك المثالية للتسوق الإلكتروني في مصر. نقدم لك أفضل المنتجات بأفضل الأسعار مع خدمة توصيل سريعة وموثوقة.
            </p>
            <div className="flex gap-3" style={{ marginTop: 20 }}>
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>روابط سريعة</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/products', label: 'المنتجات' },
                { href: '/offers', label: 'العروض' },
                { href: '/about', label: 'من نحن' },
              ].map(link => (
                <li key={link.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={link.href}
                    style={{ fontSize: 14, color: '#FFFFFF', opacity: 0.9, textDecoration: 'none', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.textDecoration = 'underline' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.textDecoration = 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>خدمة العملاء</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/contact', label: 'تواصل معنا' },
                { href: '/terms', label: 'الشروط والأحكام' },
                { href: '/privacy', label: 'سياسة الخصوصية' },
                { href: '/return-policy', label: 'سياسة الإرجاع' },
              ].map(link => (
                <li key={link.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={link.href}
                    style={{ fontSize: 14, color: '#FFFFFF', opacity: 0.9, textDecoration: 'none', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.textDecoration = 'underline' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.textDecoration = 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>تواصل معنا</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li className="flex items-start gap-3" style={{ marginBottom: 12 }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ marginTop: 2 }} />
                <span style={{ fontSize: 14 }}>الزقازيق، الشرقية، مصر</span>
              </li>
              <li className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a
                  href="tel:+201234567890"
                  dir="ltr"
                  style={{ fontSize: 14, color: '#FFFFFF', textDecoration: 'none' }}
                >
                  +20 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a
                  href="mailto:info@tix-eg.com"
                  style={{ fontSize: 14, color: '#FFFFFF', textDecoration: 'none' }}
                >
                  info@tix-eg.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.3)', marginTop: 30, paddingTop: 20 }}>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            © {new Date().getFullYear()} TIX. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
