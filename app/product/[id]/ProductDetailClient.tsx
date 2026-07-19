"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Plus as PlusIcon,
  Languages,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCurrency, calculateDiscount, t, generateSlug } from "@/utils/helpers";
import ProductCard from "@/components/ProductCard";
import type { Product, VariantGroup, VariantItem } from "@/utils/Types/common";
import { useRouter } from "next/navigation";

function tLang(value: any, lang: 'ar' | 'en'): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return lang === 'ar' ? (value.ar || value.en || '') : (value.en || value.ar || '');
  }
  return String(value);
}

function hasMultiLang(value: any): boolean {
  return typeof value === 'object' && value !== null && !!(value.ar && value.en);
}

/* ─── Stars ─── */
function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(value || 0)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < rounded ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

/* ─── Accordion ─── */
function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        className="flex items-center justify-between w-full py-4 text-base font-semibold hover:text-black transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="text-sm text-gray-600 leading-relaxed pb-4">{children}</div>}
    </div>
  );
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<VariantGroup | null>(null);
  const [selectedItem, setSelectedItem] = useState<VariantItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [complementaryProducts, setComplementaryProducts] = useState<any[]>([]);
  const [selectedBoughtTogether, setSelectedBoughtTogether] = useState<string[]>([]);

  const { addToCart } = useCart();
  const { state: authState } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [descLang, setDescLang] = useState<'ar' | 'en'>('ar');

  // Reset quantity when variant changes
  useEffect(() => { setQuantity(1); }, [selectedItem]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      if (response.data.status) {
        const p = response.data.data;
        setProduct(p);
        if (p.groups?.length > 0) {
          setSelectedGroup(p.groups[0]);
          setSelectedItem(p.groups[0].items?.[0] || null);
        }
        // Fetch related + complementary from API
        fetchRelated(p.category_id || p.category?.id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطأ في تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (categoryId?: number) => {
    const mapProducts = (data: any[]) =>
      data
        .filter((p: any) => String(p.id) !== productId)
        .map((p: any) => ({
          id: String(p.id),
          name: p.name,
          price: p.price_after || p.price,
          originalPrice: p.price_before,
          image: p.images?.[0] || p.image || "/pl1.jpg",
          discount: p.discount || 0,
          rating: p.reviews?.average_rating || 0,
          reviewsCount: p.reviews?.count || 0,
        }));

    try {
      // Fetch related (same subcategory) and complementary (different products) in parallel
      const [relatedRes, compRes] = await Promise.allSettled([
        api.get(`/product/filter?related_to=${productId}&per_page=8`),
        categoryId
          ? api.get(`/products?category_id=${categoryId}&limit=10`)
          : api.get(`/product/discounted`),
      ]);

      // Related products (same subcategory, excluding current product)
      if (relatedRes.status === "fulfilled" && relatedRes.value.data.status) {
        const data = Array.isArray(relatedRes.value.data.data)
          ? relatedRes.value.data.data
          : relatedRes.value.data.data?.data || [];
        setRelatedProducts(mapProducts(data).slice(0, 8));
      }

      // Complementary products (same category but different from related, or discounted)
      if (compRes.status === "fulfilled" && compRes.value.data.status) {
        const data = Array.isArray(compRes.value.data.data)
          ? compRes.value.data.data
          : compRes.value.data.data?.data || [];
        setComplementaryProducts(mapProducts(data).slice(0, 5));
      }
    } catch {
      /* silent */
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      if (res.data.status) {
        setReviewsData(res.data.data);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [productId]);

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      toast.info("سجّل الدخول أولاً");
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product!.id, quantity, selectedItem?.id || null);
      toast.success("تمت الإضافة للسلة");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطأ في الإضافة");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!authState.isAuthenticated) {
      toast.info("سجّل الدخول أولاً");
      return;
    }
    try {
      await toggleWishlist(product!.id);
      fetchProduct();
    } catch {
      toast.error("خطأ");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.isAuthenticated) {
      toast.info("سجّل الدخول أولاً لإضافة تقييم");
      return;
    }
    try {
      setReviewSubmitting(true);
      const formData = new FormData();
      formData.append("rating", reviewRating.toString());
      formData.append("comment", reviewText);
      formData.append("product_id", productId);
      if (reviewImage) {
        formData.append("image", reviewImage);
      }

      await api.post(`/products/${productId}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("تم حفظ تقييمك");
      setReviewText("");
      setReviewImage(null);
      fetchProduct();
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "تعذّر إرسال التقييم");
    } finally {
      setReviewSubmitting(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px" }}>
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
    );
  }

  if (!product) {
    return (
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 20px" }}
        className="text-center"
      >
        <p className="text-2xl" style={{ color: "#666" }}>
          المنتج غير موجود
        </p>
        <Link href="/" className="btn-primary mt-6 inline-block">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  /* ─── Derived data ─── */
  const currentPrice = selectedItem?.price_after || product.price_after || product.price;
  const originalPrice = selectedItem?.price_before || product.price_before || 0;
  const discountPct = calculateDiscount(originalPrice, currentPrice);
  const images = product.images?.length > 0 ? product.images : ["/pl1.jpg"];
  const features = Array.isArray(product.prod_features) && product.prod_features.length > 0
    ? product.prod_features.map((f: any) => typeof f === 'object' ? t(f.name || f) : f)
    : Array.isArray(product.features)
      ? product.features.filter(Boolean).map((f: any) => typeof f === 'object' ? t(f) : f)
      : [];
  const handleAddBoughtTogether = async () => {
    if (!authState.isAuthenticated) {
      toast.info("سجّل الدخول أولاً لإضافة المنتجات للسلة");
      return;
    }
    try {
      setAddingToCart(true);
      // Add main product if selected
      if (selectedBoughtTogether.includes(String(product.id))) {
        await addToCart(product.id, 1, selectedItem?.id || null);
      }
      // Add other selected products
      for (const prodId of selectedBoughtTogether) {
        if (prodId !== String(product.id)) {
          await addToCart(Number(prodId), 1);
        }
      }
      toast.success("تم إضافة المنتجات المختارة للسلة");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء إضافة المنتجات");
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleBoughtTogether = (id: string) => {
    setSelectedBoughtTogether(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const calculateTotalBoughtTogether = () => {
    let total = 0;
    if (selectedBoughtTogether.includes(String(product.id))) {
      total += currentPrice;
    }
    complementaryProducts.forEach(p => {
      if (selectedBoughtTogether.includes(String(p.id))) {
        total += p.price;
      }
    });
    return total;
  };

  const faqs = Array.isArray(product.qas) && product.qas.length > 0
    ? product.qas
    : Array.isArray(product.faqs) ? product.faqs : [];
  const rawStock = selectedItem?.quantity ?? product.quantity ?? null;
  const maxStock = rawStock ?? 999;
  const maxOrderQty = product.max_order_quantity ?? null;
  const maxQty = maxOrderQty !== null
    ? Math.min(maxStock, maxOrderQty)
    : maxStock === 999 ? 999 : maxStock;
  const stockKnown = rawStock !== null;
  const inStock = product.in_stock !== false && product.quantity !== 0 && maxStock > 0;

  // Reviews — API returns data as a direct array
  const reviewsList: any[] = Array.isArray(reviewsData) ? reviewsData : reviewsData?.reviews || [];
  const reviewCount = reviewsData?.total_reviews ?? reviewsList.length;
  const avgRating = reviewsData?.average_rating ??
    (reviewsList.length > 0 ? reviewsList.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewsList.length : 0);

  const wishlisted = product.is_fav || isInWishlist(product.id);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#666" }}>
        <Link href="/" className="hover:text-black transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href="/products" className="hover:text-black transition-colors">
              {t(product.category)}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: "#212121" }} className="truncate max-w-[200px]">
          {t(product.name)}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ═══ Column 1: Images ═══ */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#F5F5F5" }}>
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
                    src={typeof img === "string" ? img : "/pl1.jpg"}
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
          {/* Brand */}
          {product?.brand?.id ? (
            <Link
              href={`/brand/${product.brand.id}?name=${encodeURIComponent(t(product.brand.name ?? product.brand))}`}
              className="text-sm font-semibold text-primary hover:underline mb-1 self-start"
            >
              {t(product.brand.name ?? product.brand)}
            </Link>
          ) : product?.brand ? (
            <span className="text-sm font-semibold text-primary mb-1">
              {t(typeof product.brand === "object" ? product.brand.name : product.brand)}
            </span>
          ) : null}

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: "#212121" }}>
            {t(product.name)}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating value={avgRating} />
            <span style={{ fontSize: 14, color: "#666" }}>
              {avgRating > 0 ? `${avgRating.toFixed(1)} · ` : ""}
              {(reviewCount ?? 0).toLocaleString()} تقييم
            </span>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-black mt-4">
            {(currentPrice ?? 0).toLocaleString("en-US")} EGP
          </div>

          {/* Original Price + Discount */}
          {originalPrice > currentPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg text-gray-400 line-through">
                {(originalPrice ?? 0).toLocaleString("en-US")} EGP
              </span>
              <span className="px-2 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                -{discountPct}%
              </span>
            </div>
          )}

          {/* Stock Status + Returnable */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {inStock ? (
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#16a34a]">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                متوفر
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                غير متوفر
              </div>
            )}
          </div>

          {/* Vendor */}
          {product?.vendor?.store_name && (
            <p className="text-sm mt-3" style={{ color: "#666" }}>
              المتجر:{" "}
              <Link
                href={`/vendor/${product.vendor.id}`}
                className="font-medium hover:text-primary transition-colors"
                style={{ color: "#212121" }}
              >
                {t(product.vendor.store_name)}
              </Link>
            </p>
          )}

          {/* ── Color Selection ── */}
          {product.groups && product.groups.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2" style={{ color: "#212121" }}>
                اختر اللون:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.groups.map((group: VariantGroup, idx: number) => (
                  <button
                    key={idx}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${selectedGroup?.value === group.value
                      ? "border-black ring-2 ring-offset-2 ring-black"
                      : "border-transparent"
                      }`}
                    style={{ backgroundColor: group.meta?.code || "#ddd" }}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedItem(group.items?.[0] || null);
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
                      className={`px-4 py-2 text-sm font-medium border-2 rounded-lg transition-colors ${selectedItem?.id === item.id
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400"
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
          {inStock && (
            <>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit">
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
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="px-4 py-2.5 text-lg font-medium hover:bg-gray-50 transition-colors"
                    disabled={quantity >= maxQty}
                  >
                    +
                  </button>
                </div>
                {stockKnown && maxStock <= 10 && (
                  <div className="text-sm">
                    <span className="text-gray-500">الكمية المتاحة: </span>
                    <span className={`font-semibold ${maxStock <= 3 ? 'text-red-600' : 'text-amber-500'}`}>
                      {maxStock} قطعة
                    </span>
                    {maxStock <= 3 && (
                      <span className="text-red-600 text-xs block font-medium">آخر قطع!</span>
                    )}
                  </div>
                )}
                {maxOrderQty !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    الحد الأقصى للطلب: <span className="font-semibold text-gray-600">{maxOrderQty} قطعة</span>
                  </p>
                )}
              </div>
            </>
          )}
          {!inStock && (
            <div className="mt-4 px-4 py-3 bg-gray-100 rounded-xl text-center">
              <p className="text-base font-semibold text-gray-500">غير متوفر في المخزون</p>
            </div>
          )}

          {/* ── Action Buttons ── */}
          {/* Buy Now */}
          <button
            onClick={async () => {
              if (!authState.isAuthenticated) { toast.info("سجّل الدخول أولاً"); return; }
              try {
                setAddingToCart(true);
                await addToCart(product!.id, quantity, selectedItem?.id || null);
                router.push('/checkout');
              } catch (error: any) {
                toast.error(error.response?.data?.message || "خطأ في الإضافة");
                setAddingToCart(false);
              }
            }}
            disabled={addingToCart || !inStock}
            className="w-full h-12 bg-black text-white text-base font-semibold rounded-xl hover:bg-gray-900 transition-colors mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? "جاري الإضافة..." : "اشتري الآن"}
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
            className={`w-full h-11 text-sm font-medium rounded-xl border transition-colors mt-2 flex items-center justify-center gap-2 ${wishlisted
              ? "bg-red-50 text-red-500 border-red-200"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:text-black"
              }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
            {wishlisted ? "في المفضلة" : "أضف للمفضلة"}
          </button>

          {/* ── Feature Values ── */}
          {Array.isArray(product.feature_values) && product.feature_values.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
              {product.feature_values.map((f: any) => (
                <div
                  key={f.id}
                  className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-gray-50"
                >
                  {f.logo_url ? (
                    <img src={f.logo_url} alt={f.title} className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="w-6 h-6" />
                  )}
                  <span className="text-xs font-semibold text-gray-800">{f.title}</span>
                  {f.value && <span className="text-xs text-gray-500">{f.value}</span>}
                </div>
              ))}
            </div>
          )}

          {/* ── Features ── */}
          {features.length > 0 && (
            <div className="mt-6 p-5 bg-gray-50 rounded-2xl space-y-4">
              {features.map((f: string, i: number) => (
                <div key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: f }} />
              ))}
            </div>
          )}

          {/* ── Attributes / Specifications ── */}
          {Array.isArray(product.attributes) && product.attributes.length > 0 && (
            <div className="mt-6">
              <Accordion title="المواصفات">
                <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {product.attributes.map((attr: { name: string; value: string }, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-center text-sm ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <span className="w-1/2 px-4 py-2.5 font-medium text-gray-700 border-l border-gray-200">
                        {attr.name}
                      </span>
                      <span className="w-1/2 px-4 py-2.5 text-gray-600">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>
          )}

          {/* ── Video ── */}
          {product.video && (
            <div className="mt-8">
              <h3 className="text-base font-bold mb-3">فيديو المنتج</h3>
              <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video">
                <video
                  src={product.video}
                  controls
                  className="w-full h-full object-contain"
                  poster={typeof product.images?.[0] === "string" ? product.images[0] : undefined}
                />
              </div>
            </div>
          )}

          {/* ── Accordions ── */}
          <div className="mt-6 border-t border-gray-100">
            {/* Description */}
            {product.long_description && (
              <Accordion
                title={
                  <div className="flex items-center justify-between w-full">
                    <span>الوصف</span>
                    {hasMultiLang(product.long_description) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDescLang(l => l === 'ar' ? 'en' : 'ar'); }}
                        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-black transition-colors mr-4"
                      >
                        <Languages className="w-3.5 h-3.5" />
                        {descLang === 'ar' ? 'EN' : 'عربي'}
                      </button>
                    )}
                  </div>
                }
                defaultOpen
              >
                <div
                  className="leading-relaxed prose prose-sm max-w-none text-gray-700 [&_p]:mb-3 [&_br]:block [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5"
                  dir={descLang === 'en' ? 'ltr' : 'rtl'}
                  style={{ textAlign: descLang === 'en' ? 'left' : 'right' }}
                  dangerouslySetInnerHTML={{ __html: tLang(product.long_description, descLang) }}
                />
              </Accordion>
            )}

            {/* Reviews */}
            <Accordion title={`التقييمات ${reviewCount > 0 ? `(${reviewCount})` : ""}`} defaultOpen={reviewCount > 0}>
              {/* Rating Summary */}
              {reviewCount > 0 && (
                <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-2xl mb-6">
                  {/* Big Average */}
                  <div className="flex flex-col items-center justify-center min-w-[100px]">
                    <span className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
                    <div className="flex gap-0.5 my-1.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{reviewCount} تقييم</span>
                  </div>
                  {/* Bars */}
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(n => {
                      const count = reviewsList.filter((r: any) => Math.round(r.rating) === n).length;
                      const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4 text-left">{n}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-left">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">لا توجد تقييمات بعد — كن أول من يقيّم!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviewsList.map((r: any) => (
                    <div key={r.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {(r.user_name || r.user || r.name || "م").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{r.user_name || r.user || r.name || "مستخدم"}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`w-3 h-3 ${n <= Math.round(r.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.created_at && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(r.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {(r.comment || r.review) && <p className="text-sm text-gray-600 leading-relaxed pr-12">{r.comment || r.review}</p>}
                      {(r.image_url || r.image) && (
                        <div className="mt-3 pr-12">
                          <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-gray-100">
                            <Image src={r.image_url || r.image} alt="صورة التقييم" fill className="object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              <div className="border-t border-gray-100 pt-5 mt-2">
                <h4 className="text-sm font-bold text-gray-800 mb-4">أضف تقييمك</h4>
                {authState.isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Stars */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">تقييمك</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReviewRating(n)}
                          >
                            <Star className={`w-7 h-7 transition-colors ${n <= (hoverRating || reviewRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Comment */}
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="شاركنا رأيك في المنتج (اختياري)"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 transition-colors"
                      rows={3}
                      dir="rtl"
                    />
                    {/* Image Upload */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">إرفاق صورة (اختياري)</label>
                      <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                        <PlusIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{reviewImage ? reviewImage.name : "اختر صورة"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setReviewImage(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="h-11 px-8 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      <Link href="/login" className="font-semibold text-gray-900 hover:underline">سجّل الدخول</Link>{" "}
                      لإضافة تقييمك على هذا المنتج
                    </p>
                  </div>
                )}
              </div>
            </Accordion>

            {/* FAQ */}
            {faqs.length > 0 && (
              <Accordion title="الأسئلة الشائعة">
                <div className="space-y-3">
                  {faqs.map((faq: any, idx: number) => (
                    <div key={faq.id ?? idx}>
                      <p className="font-semibold text-gray-800 mb-1" dangerouslySetInnerHTML={{ __html: t(faq.question) }} />
                      <div className="text-gray-600 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: t(faq.answer) }} />
                    </div>
                  ))}
                </div>
              </Accordion>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Section - Larger Cards */}
      {complementaryProducts.length > 0 && (
        <div className="mt-8 p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <h3 className="text-base font-bold mb-6 text-gray-900">يباع معها أيضاً</h3>

          <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Main Product */}
            <div className="flex-shrink-0 w-32 flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group">
                <input
                  type="checkbox"
                  checked={selectedBoughtTogether.includes(String(product.id))}
                  onChange={() => toggleBoughtTogether(String(product.id))}
                  className="absolute top-2 right-2 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                />
                <Image src={images[0]} alt="" fill className="object-contain p-1" />
              </div>
              <div className="text-center w-full">
                <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2 mb-1 h-7">{t(product.name)}</p>
                <p className="text-xs font-black text-gray-900">{formatCurrency(currentPrice)}</p>
              </div>
            </div>

            {complementaryProducts.slice(0, 3).map((prod) => (
              <div key={prod.id} className="flex items-start gap-3">
                <div className="flex items-center justify-center h-32 text-gray-300">
                  <PlusIcon className="w-4 h-4" />
                </div>
                <div className="flex-shrink-0 w-32 flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group">
                    <input
                      type="checkbox"
                      checked={selectedBoughtTogether.includes(String(prod.id))}
                      onChange={() => toggleBoughtTogether(String(prod.id))}
                      className="absolute top-2 right-2 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                    />
                    <Image src={prod.image} alt="" fill className="object-contain p-1" />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2 mb-1 h-7">{t(prod.name)}</p>
                    <p className="text-xs font-black text-gray-900">{formatCurrency(prod.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={handleAddBoughtTogether}
              disabled={selectedBoughtTogether.length === 0 || addingToCart}
              className="w-full bg-white text-black border border-black hover:bg-gray-50 h-12 rounded-xl font-bold text-base transition-all focus:ring-0 focus-visible:ring-0 shadow-sm"
            >
              اشتري {selectedBoughtTogether.length} معاً بسعر {formatCurrency(calculateTotalBoughtTogether())}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Complementary Products — "اشتري معاها في سلة وحدة ووفر" ═══ */}
      {complementaryProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">اشتري معاها في سلة وحدة ووفر</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide">
            {complementaryProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${generateSlug(t(prod.name))}/${prod.id}`}
                className="shrink-0 w-44 md:w-auto bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                  <Image
                    src={prod.image || "/pl1.jpg"}
                    alt={t(prod.name)}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "#212121" }}>
                  {t(prod.name)}
                </p>
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(prod.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 mr-1">({prod.reviewsCount || 0})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {(prod.price || 0).toLocaleString("ar-EG")} ج.م
                  </span>
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
          background: rgba(255, 255, 255, 0.9);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
          background: #ff8c00;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
