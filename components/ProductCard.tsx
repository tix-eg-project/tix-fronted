'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, calculateDiscount, t } from '@/lib/utils'
import { toast } from 'react-toastify'

type ProductCardProps = {
  id: string | number
  name: string
  price: number
  originalPrice?: number
  image: string
  rating?: number
  reviewsCount?: number
  discount?: number
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewsCount,
  discount,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { state: authState } = useAuth()

  const discountPct = discount || calculateDiscount(originalPrice || 0, price)
  const wishlisted = isInWishlist(id)
  const productName = t(name)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!authState.isAuthenticated) {
      toast.info('سجّل الدخول أولاً لإضافة المنتجات للسلة')
      return
    }
    try {
      await addToCart(id)
      toast.success('تمت الإضافة للسلة')
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!authState.isAuthenticated) {
      toast.info('سجّل الدخول أولاً')
      return
    }
    try {
      await toggleWishlist(id)
    } catch {
      toast.error('حدث خطأ')
    }
  }

  return (
    <div
      className="group"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease-in-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
    >
      {/* Image */}
      <Link href={`/product/${id}`} className="block relative overflow-hidden" style={{ height: 200, borderRadius: 4, marginBottom: 12 }}>
        <Image
          src={image || '/pl1.jpg'}
          alt={productName}
          fill
          className="object-cover group-hover:scale-105"
          style={{ transition: 'transform 0.3s ease-in-out' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
        {/* Discount Badge */}
        {discountPct > 0 && (
          <span
            className="absolute top-2 right-2"
            style={{
              backgroundColor: '#FF8C00',
              color: '#FFFFFF',
              fontSize: 12,
              padding: '4px 8px',
              borderRadius: 4,
              fontWeight: 700,
            }}
          >
            -{discountPct}%
          </span>
        )}
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="أضف للمفضلة"
          className="absolute top-2 left-2 flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            color: wishlisted ? '#F44336' : '#999999',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* Details */}
      <div>
        <Link href={`/product/${id}`}>
          <h3
            className="line-clamp-2"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#212121',
              marginBottom: 8,
              minHeight: 40,
              transition: 'color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF8C00')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#212121')}
          >
            {productName}
          </h3>
        </Link>

        {/* Rating */}
        {rating !== undefined && rating > 0 && (
          <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
            <Star className="w-4 h-4" style={{ color: '#FF8C00', fill: '#FF8C00' }} />
            <span style={{ fontSize: 12, color: '#666666', fontWeight: 500 }}>{rating}</span>
            {reviewsCount !== undefined && (
              <span style={{ fontSize: 12, color: '#999999' }}>({reviewsCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FF8C00' }}>{formatCurrency(price)}</span>
          {originalPrice && originalPrice > price && (
            <span style={{ fontSize: 14, color: '#999999', textDecoration: 'line-through', marginRight: 8 }}>
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 btn-primary"
          style={{ padding: '8px 12px', fontSize: 14 }}
        >
          <ShoppingCart className="w-4 h-4" />
          أضف للسلة
        </button>
      </div>
    </div>
  )
}
