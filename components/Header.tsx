'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import {
  Search, ShoppingCart, User, Menu, X, Heart,
  ChevronDown, LogOut, Package, UserCircle
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

  // Click outside to close
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

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.data.status) {
          setSearchResults(response.data.data || [])
          setShowSearchResults(true)
        }
      } catch {
        setSearchResults([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'المنتجات' },
    { href: '/offers', label: 'العروض' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'تواصل معنا' },
  ]

  return (
    <header
      className="sticky top-0 z-[1000]"
      style={{ backgroundColor: '#000000', borderBottom: '2px solid #FF8C00' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Main Row */}
        <div className="flex items-center justify-between gap-4" style={{ height: 70, padding: '10px 0' }}>
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span style={{ color: '#FF8C00', fontSize: 24, fontWeight: 700 }}>TIX</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 relative" style={{ maxWidth: 300, margin: '0 30px' }}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  backgroundColor: '#1a1a1a',
                  border: '2px solid #FF8C00',
                  color: '#FFFFFF',
                  padding: '10px 15px 10px 40px',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999999' }} />
            </div>
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div
                className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto z-50 animate-slide-down"
                style={{ backgroundColor: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '1px solid #E0E0E0' }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchSelect(item.id)}
                      className="w-full text-right px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: '1px solid #E0E0E0', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#999999' }} />
                      <span style={{ fontSize: 14, color: '#212121' }} className="truncate">{item.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center" style={{ color: '#666666', fontSize: 14 }}>
                    لا توجد نتائج
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 rounded-md"
              style={{ color: '#FFFFFF', transition: 'color 0.2s' }}
              aria-label="المفضلة"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            >
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-md"
              style={{ color: '#FFFFFF', transition: 'color 0.2s' }}
              aria-label="السلة"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartState.count > 0 && (
                <span
                  className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                  style={{ backgroundColor: '#FF8C00', color: '#FFFFFF', fontSize: 10, fontWeight: 700 }}
                >
                  {cartState.count > 99 ? '99+' : cartState.count}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {authState.isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-md flex items-center gap-1"
                  style={{ color: '#FFFFFF', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                >
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                  <ChevronDown className="w-3 h-3 hidden md:block" />
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 w-52 overflow-hidden animate-slide-down z-50"
                    style={{ backgroundColor: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '1px solid #E0E0E0' }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #E0E0E0' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#212121' }} className="truncate">
                        {authState.user?.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#666666' }} className="truncate" dir="ltr">
                        {authState.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ fontSize: 14, color: '#212121', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <UserCircle className="w-4 h-4" />
                      حسابي
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ fontSize: 14, color: '#212121', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Package className="w-4 h-4" />
                      طلباتي
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3"
                      style={{ fontSize: 14, color: '#F44336', borderTop: '1px solid #E0E0E0', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF5F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary hidden md:flex" style={{ padding: '8px 16px', fontSize: 14 }}>
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md"
              style={{ color: '#FFFFFF' }}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden" style={{ paddingBottom: 10 }}>
          <input
            type="text"
            placeholder="ابحث عن منتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 40,
              backgroundColor: '#1a1a1a',
              border: '2px solid #FF8C00',
              color: '#FFFFFF',
              padding: '8px 15px',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 0' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 500,
                padding: '6px 15px',
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF8C00'
                e.currentTarget.style.borderBottomColor = '#FF8C00'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFFFFF'
                e.currentTarget.style.borderBottomColor = 'transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden animate-slide-down" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md"
                  style={{
                    padding: '12px 16px',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FF8C00'
                    e.currentTarget.style.backgroundColor = 'rgba(255,140,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#FFFFFF'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {!authState.isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center"
                  style={{ marginTop: 12, padding: '10px 16px' }}
                >
                  تسجيل الدخول
                </Link>
              )}
              {authState.isAuthenticated && (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md"
                    style={{ padding: '12px 16px', color: '#FFFFFF', fontWeight: 500 }}
                  >
                    حسابي
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="rounded-md text-right"
                    style={{ padding: '12px 16px', color: '#F44336', fontWeight: 500 }}
                  >
                    تسجيل الخروج
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
