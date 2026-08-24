'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  Search, ShoppingCart, User, Menu, X, Heart,
  ChevronDown, LogOut, Package, UserCircle
} from 'lucide-react'
import api from '@/lib/api'
import { generateSlug, t as tApi } from '@/utils/helpers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CategoryBar from './CategoryBar'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { lang, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { state: cartState } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { state: authState, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
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

  const handleSearchSelect = (id: number | string, name?: any) => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    const slug = generateSlug(tApi(name, lang))
    router.push(slug ? `/product/${id}/${slug}` : `/product/${id}`)
  }

  const handleSearchAll = () => {
    if (!searchQuery.trim()) return
    setShowSearchResults(false)
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchAll()
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: t('header.home') },
    { href: '/products', label: t('header.products') },
    { href: '/offers', label: t('header.offers') },
    { href: '/about', label: t('header.about') },
    { href: '/contact', label: t('header.contact') },
  ]

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'
  if (isAuthPage) return null

  return (
    <header className="bg-white text-black border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-bold text-black">TIX</span>
          </Link>

          {/* Search Bar in the middle */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-white border border-gray-400 text-black placeholder:text-gray-500 ps-10 focus-visible:border-black focus-visible:ring-0"
              />
              <button
                onClick={handleSearchAll}
                className="absolute end-0 top-0 h-full px-3 flex items-center hover:text-black text-gray-600 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute top-full mt-2 w-full z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearchSelect(item.id, item.name)}
                        className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-900 truncate">{tApi(item.name, lang)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                      {t('common.noResults')}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearchAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-900 transition-colors border-t border-gray-200"
                >
                  <Search className="w-4 h-4" />
                  {t('header.viewAllResults', { query: searchQuery })}
                </button>
              </div>
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {authState.isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-semibold hidden sm:inline">{authState.user?.name}</span>
                  <ChevronDown className="h-4 w-4 hidden md:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full start-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{authState.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate" dir="ltr">{authState.user?.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                      <UserCircle className="h-4 w-4" />
                      {t('header.myAccount')}
                    </Link>
                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                      <Package className="h-4 w-4" />
                      {t('header.myOrders')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-start px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 border-top border-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100 relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -end-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100 relative">
                <ShoppingCart className="h-5 w-5" />
                {cartState.count > 0 && (
                  <span className="absolute -top-1 -end-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartState.count > 99 ? '99+' : cartState.count}
                  </span>
                )}
              </Button>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Input
              type="search"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-white border border-gray-300 focus-visible:border-black focus-visible:ring-0"
            />
            <button
              onClick={handleSearchAll}
              className="absolute end-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-black transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <CategoryBar />
    </header>
  )
}
