'use client'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'

export default function WishlistPage() {
  const { items, isLoading, refreshWishlist } = useWishlist()
  const { state: authState } = useAuth()
  const { t } = useLanguage()

  // Redirect if not logged in
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = '/login?redirect=/wishlist'
    }
  }, [authState.isLoading, authState.isAuthenticated])

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshWishlist()
    }
  }, [authState.isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-72 bg-white rounded-2xl shadow-sm border border-gray-50" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('wishlist.title', { count: items.length })}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6">
                  <Heart className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">{t('wishlist.emptyTitle')}</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('wishlist.emptyDesc')}</p>
                <Link href="/">
                  <Button className="bg-black text-white hover:bg-gray-800 px-10 rounded-xl h-12 font-bold text-lg transition-all shadow-lg shadow-black/10">
                    {t('wishlist.exploreStore')}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item: any) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ProductCard {...item} />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
