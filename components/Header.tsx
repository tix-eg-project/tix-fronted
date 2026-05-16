'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import {
  Search, ShoppingCart, User, Heart, Menu, X,
  ChevronDown, LogOut, Package, UserCircle, Star, RotateCcw
} from 'lucide-react'
import api from '@/lib/api'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { state: cartState } = useCart()
  const { state: authState, logout } = useAuth()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search — 400ms
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(trimmed)}`)
        if (response.data.status) {
          const data = response.data.data
          const results = Array.isArray(data) ? data : data?.data || []
          setSearchResults(results)
          setShowSearchResults(true)
        }
      } catch {
        setSearchResults([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearchResults([])
    setShowSearchResults(false)
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchSubmit()
    }
  }

  const handleSearchSelect = (id: number | string) => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    router.push(`/product/${id}`)
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-[99] bg-white" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-[1280px] mx-auto flex items-center gap-5" style={{ height: 66, padding: '0 32px' }}>
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-2px' }}>TIX</span>
        </Link>

        {/* Search Bar — Desktop */}
        <div ref={searchRef} className="hidden md:flex flex-1 relative" style={{ maxWidth: 600 }}>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث عن منتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-white text-[#111] outline-none placeholder:text-[#9ca3af]"
              style={{
                height: 40,
                border: '1.5px solid var(--color-border-strong)',
                borderRadius: 8,
                paddingInlineStart: 12,
                paddingInlineEnd: 40,
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="absolute top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              style={{ insetInlineEnd: 8, padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}
              aria-label="بحث"
            >
              <Search style={{ width: 18, height: 18, color: '#9ca3af' }} />
            </button>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div
              className="absolute top-full mt-1.5 w-full max-h-80 overflow-y-auto z-50 bg-white animate-slide-down"
              style={{ borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--color-border)' }}
            >
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchSelect(item.id)}
                      className="w-full text-right flex items-center gap-3 hover:bg-[#f9f9f9] transition-colors"
                      style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}
                    >
                      <Search style={{ width: 14, height: 14, color: '#9ca3af', flexShrink: 0 }} />
                      <span className="truncate" style={{ fontSize: 13, color: '#111' }}>{item.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center hover:bg-[#f9f9f9] transition-colors"
                    style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, borderTop: '1px solid #f3f4f6' }}
                  >
                    عرض كل النتائج لـ "{searchQuery.trim()}"
                  </button>
                </>
              ) : (
                <div className="text-center" style={{ padding: '20px 14px' }}>
                  <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8 }}>
                    لا توجد نتائج لـ "{searchQuery.trim()}"
                  </p>
                  <button
                    onClick={handleSearchSubmit}
                    style={{ color: 'var(--color-primary)', fontSize: 13, fontWeight: 500 }}
                    className="hover:underline"
                  >
                    البحث في كل المنتجات
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* User */}
          {authState.isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                style={{ width: 38, height: 38, borderRadius: 8 }}
              >
                <User style={{ width: 20, height: 20, color: '#111' }} />
              </button>
              {userMenuOpen && (
                <div
                  className="absolute start-0 top-full mt-1.5 w-56 z-50 bg-white animate-slide-down overflow-hidden"
                  style={{ borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--color-border)' }}
                >
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                      {authState.user?.name}
                    </p>
                    <p className="truncate" dir="ltr" style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {authState.user?.email}
                    </p>
                  </div>
                  {[
                    { href: '/account', label: 'حسابي', icon: UserCircle },
                    { href: '/account/orders', label: 'طلباتي', icon: Package },
                    { href: '/account/returns', label: 'الإرجاع', icon: RotateCcw },
                    { href: '/account/reviews', label: 'التقييمات', icon: Star },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 hover:bg-[#f9f9f9] transition-colors"
                      style={{ padding: '10px 14px', fontSize: 13, color: '#4b5563' }}
                    >
                      <item.icon style={{ width: 16, height: 16 }} />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full hover:bg-[#fef2f2] transition-colors"
                    style={{ padding: '10px 14px', fontSize: 13, color: '#dc2626', borderTop: '1px solid var(--color-border)' }}
                  >
                    <LogOut style={{ width: 16, height: 16 }} />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
              style={{ width: 38, height: 38, borderRadius: 8 }}
              aria-label="تسجيل الدخول"
            >
              <User style={{ width: 20, height: 20, color: '#111' }} />
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
            style={{ width: 38, height: 38, borderRadius: 8 }}
            aria-label="المفضلة"
          >
            <Heart style={{ width: 20, height: 20, color: '#111' }} />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
            style={{ width: 38, height: 38, borderRadius: 8 }}
            aria-label="السلة"
          >
            <ShoppingCart style={{ width: 20, height: 20, color: '#111' }} />
            {cartState.count > 0 && (
              <span
                className="absolute flex items-center justify-center font-montserrat"
                style={{
                  top: 2, insetInlineEnd: 2,
                  minWidth: 17, height: 17,
                  borderRadius: '50%',
                  backgroundColor: '#111',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {cartState.count > 99 ? '99+' : cartState.count}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
            style={{ width: 38, height: 38, borderRadius: 8 }}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden" style={{ padding: '0 16px 12px' }}>
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن منتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-white text-[#111] outline-none placeholder:text-[#9ca3af]"
            style={{
              height: 40,
              border: '1.5px solid var(--color-border-strong)',
              borderRadius: 8,
              paddingInlineStart: 12,
              paddingInlineEnd: 40,
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ insetInlineEnd: 8, padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}
            aria-label="بحث"
          >
            <Search style={{ width: 18, height: 18, color: '#9ca3af' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden animate-slide-down" style={{ borderTop: '1px solid var(--color-border)', padding: '12px 16px' }}>
          <div className="flex flex-col gap-1">
            {[
              { href: '/', label: 'الرئيسية' },
              { href: '/products', label: 'المنتجات' },
              { href: '/offers', label: 'العروض' },
              { href: '/about', label: 'من نحن' },
              { href: '/contact', label: 'تواصل معنا' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md hover:bg-[#f9f9f9] transition-colors"
                style={{ padding: '10px 12px', fontSize: 14, fontWeight: 500, color: '#111' }}
              >
                {link.label}
              </Link>
            ))}
            {!authState.isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-action text-center"
                style={{ marginTop: 8 }}
              >
                تسجيل الدخول
              </Link>
            )}
            {authState.isAuthenticated && (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                className="rounded-md text-right"
                style={{ padding: '10px 12px', fontSize: 14, fontWeight: 500, color: '#dc2626' }}
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
