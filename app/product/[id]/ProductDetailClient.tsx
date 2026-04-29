'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import {
  ShoppingCart, Heart, Star, ChevronDown, ChevronUp,
  CheckCircle, Truck, Shield, RotateCcw, Package, Headphones
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatCurrency, calculateDiscount, t } from '@/lib/utils'
import ProductCard from '@/components/ProductCard'
import type { Product, VariantGroup, VariantItem } from '@/lib/types'

/* ─── Stars ─── */
function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(value || 0)))
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < rounded ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
        />
      ))}
    </div>
  )
}

/* ─── Accordion ─── */
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100">
      <button
        className="flex items-center justify-between w-full py-4 text-base font-semibold hover:text-black transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="text-sm text-gray-600 leading-relaxed pb-4">{children}</div>}
    </div>
  )
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<VariantGroup | null>(null)
  const [selectedItem, setSelectedItem] = useState<VariantItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [complementaryProducts, setComplementaryProducts] = useState<any[]>([])

  const { addToCart } = useCart()
  const { state: authState } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${productId}`)
      if (response.data.status) {
        const p = response.data.data
        setProduct(p)
        if (p.groups?.length > 0) {
          setSelectedGroup(p.groups[0])
          setSelectedItem(p.groups[0].items?.[0] || null)
        }
        // Fetch related + complementary from API
        fetchRelated(p.category_id || p.category?.id)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطأ في تحميل المنتج')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelated = async (categoryId?: number) => {
    try {
      // Similar products
      const params = categoryId ? `?category_id=${categoryId}&limit=8` : '?limit=8'
      const res = await api.get(`/products${params}`)
      if (res.data.status) {
        const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []
        const mapped = data
          .filter((p: any) => String(p.id) !== productId)
          .map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price_after || p.price,
            originalPrice: p.price_before,
            image: p.images?.[0] || p.image || '/pl1.jpg',
            discount: p.discount || 0,
            rating: p.reviews?.average_rating || 0,
            reviewsCount: p.reviews?.count || 0,
          }))
        setRelatedProducts(mapped.slice(0, 8))
        setComplementaryProducts(mapped.slice(0, 5))
      }
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    fetchProduct()
    window.scrollTo(0, 0)
  }, [productId])

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) { toast.info('سجّل الدخول أولاً'); return }
    try {
      setAddingToCart(true)
      await addToCart(product!.id, quantity, selectedItem?.id || null)
      toast.success('تمت الإضافة للسلة')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطأ في الإضافة')
    } finally { setAddingToCart(false) }
  }

  const handleToggleWishlist = async () => {
    if (!authState.isAuthenticated) { toast.info('سجّل الدخول أولاً'); return }
    try { await toggleWishlist(product!.id); fetchProduct() } catch { toast.error('خطأ') }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authState.isAuthenticated) { toast.info('سجّل الدخول أولاً لإضافة تقييم'); return }
    try {
      setReviewSubmitting(true)
      await api.post(`/products/${productId}/reviews`, { rating: reviewRating, review: reviewText })
      toast.success('تم حفظ تقييمك')
      setReviewText('')
      fetchProduct()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'تعذّر إرسال التقييم')
    } finally { setReviewSubmitting(false) }
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded-lg" />
            <div className="skeleton h-6 w-1/4 rounded-lg" />
            <div className="skeleton h-10 w-1/3 rounded-lg" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px' }} className="text-center">
        <p className="text-2xl" style={{ color: '#666' }}>المنتج غير موجود</p>
        <Link href="/" className="btn-primary mt-6 inline-block">العودة للرئيسية</Link>
      </div>
    )
  }

  /* ─── Derived data ─── */
  const currentPrice = selectedItem?.price_after || product.price_after || product.price
  const originalPrice = selectedItem?.price_before || product.price_before || 0
  const discountPct = calculateDiscount(originalPrice, currentPrice)
  const images = product.images?.length > 0 ? product.images : ['/pl1.jpg']
  const features = Array.isArray(product.features) ? product.features.filter(Boolean).map((f: any) => t(f)) : []
  const faqs = Array.isArray(product.faqs) ? product.faqs : []
  const inStock = product.in_stock !== false && product.quantity !== 0

  // Reviews — handle both formats safely
  const reviewsObj = (typeof product.reviews === 'object' && !Array.isArray(product.reviews)) ? product.reviews : null
  const reviewCount = reviewsObj?.count ?? (typeof product.reviews === 'number' ? product.reviews : 0)
  const reviewsList = reviewsObj?.data ?? (Array.isArray(product.reviews) ? product.reviews : [])
  const avgRating = reviewsObj?.average_rating != null ? Number(reviewsObj.average_rating) : 0

  const wishlisted = product.is_fav || isInWishlist(product.id)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: '#666' }}>
        <Link href="/" className="hover:text-black transition-colors">الرئيسية</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href="/products" className="hover:text-black transition-colors">{t(product.category)}</Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: '#212121' }} className="truncate max-w-[200px]">{t(product.name)}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ═══ Column 1: Images ═══ */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="product-swiper aspect-square"
          >
            {images.map((img: string, index: number) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <Image
                    src={typeof img === 'string' ? img : '/pl1.jpg'}
                    alt={`${t(product.name)} ${index + 1}`}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ═══ Column 2: Product Details ═══ */}
        <div className="flex flex-col">
          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: '#212121' }}>
            {t(product.name)}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating value={avgRating} />
            <span style={{ fontSize: 14, color: '#666' }}>
              {avgRating > 0 ? `${avgRating.toFixed(1)} · ` : ''}
              {reviewCount.toLocaleString()} تقييم
            </span>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-black mt-4">
            {currentPrice.toLocaleString('ar-EG')} ج.م
          </div>

          {/* Original Price + Discount */}
          {originalPrice > currentPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg text-gray-400 line-through">
                {originalPrice.toLocaleString('ar-EG')} ج.م
              </span>
              <span className="px-2 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                -{discountPct}%
              </span>
            </div>
          )}

          {/* Stock Status */}
          {inStock ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#16a34a] mt-3">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              متوفر
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-500 mt-3">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              غير متوفر
            </div>
          )}

          {/* Vendor */}
          {product.vendor?.store_name && (
            <p className="text-sm mt-3" style={{ color: '#666' }}>
              البائع: <span className="font-medium" style={{ color: '#212121' }}>{t(product.vendor.store_name)}</span>
            </p>
          )}

          {/* ── Color Selection ── */}
          {product.groups && product.groups.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2" style={{ color: '#212121' }}>اختر اللون:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.groups.map((group: VariantGroup, idx: number) => (
                  <button
                    key={idx}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedGroup?.value === group.value
                        ? 'border-black ring-2 ring-offset-2 ring-black'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: group.meta?.code || '#ddd' }}
                    onClick={() => {
                      setSelectedGroup(group)
                      setSelectedItem(group.items?.[0] || null)
                    }}
                    aria-label={group.value}
                  />
                ))}
              </div>

              {/* Size Selection */}
              {selectedGroup && selectedGroup.items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedGroup.items.map((item: VariantItem) => (
                    <button
                      key={item.id}
                      className={`px-4 py-2 text-sm font-medium border-2 rounded-lg transition-colors ${
                        selectedItem?.id === item.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      {Object.entries(item.attrs).map(([k, v]) => (
                        <span key={k}>{t(v)}</span>
                      ))}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Quantity ── */}
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit mt-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2.5 text-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-5 py-2.5 text-base font-semibold border-x-2 border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2.5 text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>

          {/* ── Action Buttons ── */}
          {/* Buy Now */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !inStock}
            className="w-full h-12 bg-black text-white text-base font-semibold rounded-xl hover:bg-gray-900 transition-colors mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? 'جاري الإضافة...' : 'اشتري الآن'}
          </button>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !inStock}
            className="w-full h-12 bg-white text-black text-base font-semibold rounded-xl border-2 border-black hover:bg-gray-50 transition-colors mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            أضف للسلة
          </button>

          {/* Add to Wishlist */}
          <button
            onClick={handleToggleWishlist}
            className={`w-full h-11 text-sm font-medium rounded-xl border transition-colors mt-2 flex items-center justify-center gap-2 ${
              wishlisted
                ? 'bg-red-50 text-red-500 border-red-200'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:text-black'
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} />
            {wishlisted ? 'في المفضلة' : 'أضف للمفضلة'}
          </button>

          {/* ── Delivery Info Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
            {[
              { icon: Truck, label: 'شحن سريع', desc: '2-5 أيام عمل' },
              { icon: Shield, label: 'ضمان الجودة', desc: 'منتج أصلي 100%' },
              { icon: RotateCcw, label: 'إرجاع سهل', desc: 'خلال 14 يوم' },
              { icon: Package, label: 'تغليف آمن', desc: 'حماية كاملة' },
              { icon: Headphones, label: 'دعم فني', desc: 'على مدار الساعة' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-gray-50">
                <Icon className="h-6 w-6 text-black" />
                <span className="text-xs font-semibold text-gray-800">{label}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </div>
            ))}
          </div>

          {/* ── Features ── */}
          {features.length > 0 && (
            <div className="mt-6 p-5 bg-gray-50 rounded-2xl">
              {features.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <CheckCircle className="h-5 w-5 text-[#16a34a] shrink-0" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Accordions ── */}
          <div className="mt-6 border-t border-gray-100">
            {/* Description */}
            {product.long_description && (
              <Accordion title="الوصف" defaultOpen>
                <p className="leading-relaxed">{t(product.long_description)}</p>
              </Accordion>
            )}

            {/* Reviews */}
            <Accordion title={`التقييمات ${reviewCount > 0 ? `(${reviewCount})` : ''}`}>
              {reviewsList.length === 0 ? (
                <p className="text-gray-500">لا توجد تقييمات بعد</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {reviewsList.map((r: any) => (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{r.user_name || '—'}</span>
                        {r.created_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(r.created_at).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                      <StarRating value={r.rating} size={14} />
                      {r.review && <p className="text-sm text-gray-600 mt-1.5">{r.review}</p>}
                    </div>
                  ))}
                </div>
              )}
              {/* Review Form */}
              {authState.isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="p-4 border border-gray-200 rounded-xl mt-3">
                  <div className="mb-3">
                    <label className="text-sm font-medium mb-1 block">تقييمك:</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(n)}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              n <= (hoverRating || reviewRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="اكتب تقييمك هنا (اختياري)"
                    className="input-field !py-2 text-sm mb-3"
                    rows={3}
                  />
                  <button type="submit" disabled={reviewSubmitting} className="btn-primary text-sm" style={{ padding: '10px 20px' }}>
                    {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              ) : (
                <p className="text-sm" style={{ color: '#666' }}>
                  <Link href="/login" style={{ color: '#FF8C00' }} className="hover:underline">سجّل الدخول</Link> لإضافة تقييم
                </p>
              )}
            </Accordion>

            {/* FAQ */}
            {faqs.length > 0 && (
              <Accordion title="الأسئلة الشائعة">
                <div className="space-y-3">
                  {faqs.map((faq: any, idx: number) => (
                    <div key={faq.id ?? idx}>
                      <p className="font-semibold text-gray-800 mb-1">{t(faq.question)}</p>
                      <p className="text-gray-600">{t(faq.answer)}</p>
                    </div>
                  ))}
                </div>
              </Accordion>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Complementary Products — "اشتري معاها في سلة وحدة ووفر" ═══ */}
      {complementaryProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">اشتري معاها في سلة وحدة ووفر</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide">
            {complementaryProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.id}`}
                className="shrink-0 w-44 md:w-auto bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                  <Image src={prod.image || '/pl1.jpg'} alt={t(prod.name)} width={200} height={200} className="object-cover w-full h-full" />
                </div>
                <p className="text-sm font-medium line-clamp-2 mb-1" style={{ color: '#212121' }}>{t(prod.name)}</p>
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(prod.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400 mr-1">({prod.reviewsCount || 0})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{(prod.price || 0).toLocaleString('ar-EG')} ج.م</span>
                  <span
                    className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-lg leading-none hover:bg-gray-800 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    +
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ Similar Products — "شاهد أيضاً — هذا قد يعجبك" ═══ */}
      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">شاهد أيضاً — هذا قد يعجبك</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                name={prod.name}
                price={prod.price}
                originalPrice={prod.originalPrice}
                image={prod.image}
                discount={prod.discount}
                rating={prod.rating}
                reviewsCount={prod.reviewsCount}
              />
            ))}
          </div>
        </section>
      )}

      {/* Swiper custom styles */}
      <style jsx global>{`
        .product-swiper .swiper-button-next,
        .product-swiper .swiper-button-prev {
          color: #212121;
          background: rgba(255,255,255,0.9);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .product-swiper .swiper-button-next::after,
        .product-swiper .swiper-button-prev::after {
          font-size: 16px;
          font-weight: bold;
        }
        .product-swiper .swiper-pagination-bullet {
          background: #999;
          opacity: 0.5;
        }
        .product-swiper .swiper-pagination-bullet-active {
          background: #FF8C00;
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
