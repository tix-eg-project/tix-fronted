'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import {
  Search, ShoppingCart, User, Menu, X, Heart,
  ChevronDown, LogOut, Package, UserCircle
} from 'lucide-react'
import api from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CategoryBar from './CategoryBar'

// Arabic synonym groups — so "هاتف" also finds "موبايل" etc.
const synonymGroups: string[][] = [
  ['هاتف', 'موبايل', 'تليفون', 'تلفون', 'جوال', 'محمول', 'phone', 'mobile'],
  ['لابتوب', 'لاب توب', 'حاسوب', 'كمبيوتر', 'laptop', 'computer'],
  ['سماعة', 'سماعات', 'هيدفون', 'ايربودز', 'earbuds', 'headphone'],
  ['شاحن', 'شواحن', 'charger'],
  ['ساعة', 'ساعات', 'watch', 'سمارت واتش'],
  ['تابلت', 'تاب', 'tablet', 'ipad', 'ايباد'],
  ['شاشة', 'شاشات', 'تلفزيون', 'تليفزيون', 'tv', 'screen'],
]

// Find synonyms for a word
function getSynonyms(word: string): string[] {
  const lower = word.toLowerCase()
  for (const group of synonymGroups) {
    if (group.some(s => s === lower || s === word)) {
      return group.filter(s => s !== lower && s !== word)
    }
  }
  return []
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { state: cartState } = useCart()
  const { state: authState, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced smart search with synonyms and suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setHasSearched(false)
      setShowSearchResults(false)
      return
    }

    const timer = setTimeout(async () => {
      const query = searchQuery.trim()
      let allProducts: any[] = []

      // 1. Search with the original query
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`)
        const rawData = response.data?.data || response.data
        const results = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : []
        allProducts = [...results]
      } catch { /* silent */ }

      // 2. If no results, try synonyms
      if (allProducts.length === 0) {
        const words = query.split(/\s+/)
        for (const word of words) {
          const syns = getSynonyms(word)
          for (const syn of syns) {
            const synQuery = query.replace(word, syn)
            try {
              const res = await api.get(`/search?q=${encodeURIComponent(synQuery)}`)
              const rawData = res.data?.data || res.data
              const results = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : []
              if (results.length > 0) {
                allProducts = [...allProducts, ...results]
                break // Found results with a synonym, stop trying
              }
            } catch { /* silent */ }
          }
          if (allProducts.length > 0) break
        }
      }

      // 3. Build text suggestions from product names
      if (allProducts.length > 0) {
        const seen = new Set<string>()
        const suggestionList: string[] = []

        // First suggestion: the query itself (like Google shows)
        suggestionList.push(query)
        seen.add(query.toLowerCase())

        // Extract unique meaningful suggestions from product names
        for (const product of allProducts) {
          const name: string = product.name || ''
          if (!name) continue

          // Add the full product name as a suggestion (shortened)
          const shortName = name.length > 50 ? name.slice(0, 50) + '...' : name
          const lowerName = shortName.toLowerCase()
          if (!seen.has(lowerName)) {
            seen.add(lowerName)
            suggestionList.push(shortName)
          }

          // Extract query + brand-like combinations
          // e.g. if query is "هاتف" and product is "هاتف سامسونج A15", suggest "هاتف سامسونج"
          const words = name.split(/\s+/)
          if (words.length >= 2) {
            const combo = `${query} ${words.find(w => w.toLowerCase() !== query.toLowerCase() && w.length > 2) || ''}`.trim()
            if (combo !== query && !seen.has(combo.toLowerCase())) {
              seen.add(combo.toLowerCase())
              suggestionList.push(combo)
            }
          }

          if (suggestionList.length >= 10) break
        }

        setSuggestions(suggestionList)
      } else {
        setSuggestions([])
      }

      setHasSearched(true)
      setShowSearchResults(true)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery('')
    setSuggestions([])
    setShowSearchResults(false)
    setHasSearched(false)
    router.push(`/products?search=${encodeURIComponent(suggestion)}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchResults(false)
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Search dropdown component — text suggestions only (like Google)
  const SearchDropdown = () => {
    if (!showSearchResults || !searchQuery.trim()) return null
    return (
      <div className="absolute top-full mt-1 w-full max-h-96 overflow-y-auto z-50 bg-white border border-gray-200 rounded-lg shadow-lg">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-right px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
            >
              <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="text-sm text-gray-900">{suggestion}</span>
            </button>
          ))
        ) : hasSearched ? (
          <div className="px-4 py-5 text-center">
            <p className="text-sm text-gray-500">لا يوجد هذا المنتج</p>
          </div>
        ) : null}
      </div>
    )
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
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Input
                type="search"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim() && hasSearched) setShowSearchResults(true) }}
                className="w-full bg-white border border-gray-400 text-black placeholder:text-gray-500 pr-10 focus-visible:border-black focus-visible:ring-0"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            </form>
            {/* Search Results Dropdown */}
            <SearchDropdown />
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
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{authState.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate" dir="ltr">{authState.user?.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                      <UserCircle className="h-4 w-4" />
                      حسابي
                    </Link>
                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                      <Package className="h-4 w-4" />
                      طلباتي
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 border-top border-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
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
              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100 relative">
                <ShoppingCart className="h-5 w-5" />
                {cartState.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartState.count > 99 ? '99+' : cartState.count}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div ref={mobileSearchRef} className="md:hidden pb-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="search"
              placeholder="ابحث عن منتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim() && hasSearched) setShowSearchResults(true) }}
              className="w-full bg-white border border-gray-300 focus-visible:border-black focus-visible:ring-0"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </form>
          <SearchDropdown />
        </div>
      </div>
      <CategoryBar />
    </header>
  )
}

