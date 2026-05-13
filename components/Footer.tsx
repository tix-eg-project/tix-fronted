'use client'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-white">TIX</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              منصة TIX هي وجهتك المثالية للتسوق الإلكتروني في مصر. نقدم لك أفضل المنتجات بأفضل الأسعار مع خدمة توصيل سريعة وموثوقة.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Mail className="h-4 w-4" />
              <span>support.tix.eg.com@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Phone className="h-4 w-4" />
              <span>01070691673</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  العروض
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">حسابي</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  تسجيل الدخول / حسابي
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  طلباتي
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">تابعنا</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#22c55e] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#1d9bf0] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#e1306c] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#ff0000] transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <h5 className="font-semibold mb-2 text-sm">اللغة</h5>
            
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} جميع الحقوق محفوظة Tix.com</p>
        </div>
      </div>
    </footer>
  )
}
