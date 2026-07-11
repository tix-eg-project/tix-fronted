'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, Heart, LogOut, RotateCcw, MapPin } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const sidebarLinks = [
  { href: '/account', label: 'بياناتي', icon: User },
  { href: '/account/orders', label: 'طلباتي', icon: Package },
  { href: '/account/addresses', label: 'عناويني', icon: MapPin },
  { href: '/account/wishlist', label: 'المفضلة', icon: Heart },
  { href: '/account/returns', label: 'المرتجعات', icon: RotateCcw },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10" dir="rtl">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">حسابي</h1>

      {/* Mobile: horizontal scrollable tabs */}
      <div className="md:hidden mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 w-max">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            )
          })}
          <button
            onClick={async () => { await logout(); window.location.href = '/' }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            خروج
          </button>
        </div>
      </div>

      {/* Desktop: sidebar + content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="hidden md:block md:col-span-1">
          <nav className="card p-3 space-y-1 sticky top-24">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-black text-white'
                    : 'text-text hover:bg-surface-2'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={async () => { await logout(); window.location.href = '/' }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </nav>
        </aside>

        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  )
}
