"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus as PlusIcon,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency, calculateDiscount, t as tApi, generateSlug } from "@/utils/helpers";
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
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between w-full py-4 text-base font-semibold hover:text-black transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
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
  const [isImageZooming, setIsImageZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Fullscreen lightbox — works on touch (mobile/tablet) and desktop alike
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxOffset, setLightboxOffset] = useState({ x: 0, y: 0 });
  const lightboxDragRef = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const openLightbox = () => {
    setLightboxScale(1);
    setLightboxOffset({ x: 0, y: 0 });
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const toggleLightboxZoom = (clientX: number, clientY: number, rect: DOMRect) => {
    if (lightboxScale > 1) {
      setLightboxScale(1);
      setLightboxOffset({ x: 0, y: 0 });
    } else {
      setLightboxScale(2.2);
      setLightboxOffset({
        x: (rect.width / 2 - (clientX - rect.left)) * 1.2,
        y: (rect.height / 2 - (clientY - rect.top)) * 1.2,
      });
    }
  };

  const handleLightboxPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;
    if (isDoubleTap) {
      toggleLightboxZoom(e.clientX, e.clientY, rect);
      lightboxDragRef.current = null;
      return;
    }
    if (lightboxScale > 1) {
      lightboxDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: lightboxOffset.x,
        startOffsetY: lightboxOffset.y,
      };
    }
  };

  const handleLightboxPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = lightboxDragRef.current;
    if (!drag) return;
    setLightboxOffset({
      x: drag.startOffsetX + (e.clientX - drag.startX),
      y: drag.startOffsetY + (e.clientY - drag.startY),
    });
  };

  const endLightboxDrag = () => { lightboxDragRef.current = null; };

  const { addToCart } = useCart();
  const { state: authState } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, lang, dir } = useLanguage();
  const router = useRouter();

  // Reset quantity and jump the gallery to the variant's own image when the variant changes
  useEffect(() => {
    setQuantity(1);
    setActiveImageIndex(0);
  }, [selectedItem]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      if (response.data.status) {
        const p = response.data.data;
        setProduct(p);
        setActiveImageIndex(0);
        if (p.groups?.length > 0) {
          setSelectedGroup(p.groups[0]);
          setSelectedItem(p.groups[0].items?.[0] || null);
        }
        // Redirect to correct slug if name changed
        const correctSlug = generateSlug(tApi(p.name, lang))
        const currentPath = window.location.pathname
        const expectedPath = `/product/${productId}/${correctSlug}`
        if (correctSlug && !currentPath.endsWith(correctSlug)) {
          window.history.replaceState(null, '', expectedPath)
        }
        // Fetch related + complementary from API
        fetchRelated(p.category_id || p.category?.id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('product.errorLoadingProduct'));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, lang]);

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      toast.info(t('product.loginFirst'));
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product!.id, quantity, selectedItem?.id || null);
      toast.success(t('product.addedToCart'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('product.errorAdding'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!authState.isAuthenticated) {
      toast.info(t('product.loginFirst'));
      return;
    }
    try {
      await toggleWishlist(product!.id);
      fetchProduct();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.isAuthenticated) {
      toast.info(t('product.loginFirstToReview'));
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
      toast.success(t('product.reviewSaved'));
      setReviewText("");
      setReviewImage(null);
      fetchProduct();
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('product.reviewSubmitFailed'));
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
          {t('product.productNotFound')}
        </p>
        <Link href="/" className="btn-primary mt-6 inline-block">
          {t('product.backToHome')}
        </Link>
      </div>
    );
  }

  /* ─── Derived data ─── */
  const currentPrice = selectedItem?.price_after || product.price_after || product.price;
  const originalPrice = selectedItem?.price_before || product.price_before || 0;
  const discountPct = calculateDiscount(originalPrice, currentPrice);
  const baseImages = product.images?.length > 0 ? product.images : ["/pl1.jpg"];
  const images = selectedItem?.image
    ? [selectedItem.image, ...baseImages.filter((img: string) => img !== selectedItem.image)]
    : baseImages;
  const features = Array.isArray(product.prod_features) && product.prod_features.length > 0
    ? product.prod_features.map((f: any) => typeof f === 'object' ? tApi(f.name || f, lang) : f)
    : Array.isArray(product.features)
      ? product.features.filter(Boolean).map((f: any) => typeof f === 'object' ? tApi(f, lang) : f)
      : [];
  const handleAddBoughtTogether = async () => {
    if (!authState.isAuthenticated) {
      toast.info(t('product.loginFirstToAddToCart'));
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
      toast.success(t('product.selectedProductsAdded'));
    } catch (error: any) {
      toast.error(t('product.errorAddingProducts'));
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
      <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap" style={{ color: "#666" }}>
        <Link href="/" className="hover:text-black transition-colors shrink-0">
          {t('header.home')}
        </Link>
        <span className="shrink-0">/</span>
        {product.category && (
          <>
            <Link href="/products" className="hover:text-black transition-colors shrink-0">
              {tApi(product.category, lang)}
            </Link>
            <span className="shrink-0">/</span>
          </>
        )}
        <span style={{ color: "#212121" }} className="truncate max-w-[160px] sm:max-w-[280px] shrink-0">
          {tApi(product.name, lang)}
        </span>
      </nav>

      {/* Mobile: Brand + Title + Rating above the image */}
      <div className="lg:hidden mb-4">
        {product?.brand?.id ? (
          <Link
            href={`/brand/${product.brand.id}?name=${encodeURIComponent(tApi(product.brand.name ?? product.brand, lang))}`}
            className="text-sm font-semibold text-primary hover:underline inline-block"
          >
            {tApi(product.brand.name ?? product.brand, lang)}
          </Link>
        ) : product?.brand ? (
          <span className="text-sm font-semibold text-primary block">
            {tApi(typeof product.brand === "object" ? product.brand.name : product.brand, lang)}
          </span>
        ) : null}

        <h1 className="text-xl font-bold leading-tight mt-1" style={{ color: "#212121" }}>
          {tApi(product.name, lang)}
        </h1>

        <div className="flex items-center gap-2 mt-2">
          <StarRating value={avgRating} />
          <span style={{ fontSize: 14, color: "#666" }}>
            {avgRating > 0 ? `${avgRating.toFixed(1)} ` : ""}
            ({(reviewCount ?? 0).toLocaleString("en-US")} {t('product.reviewsCount')})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* ═══ Column 1: Images ═══ */}
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          {/* Thumbnails rail — صف أفقي تحت الصورة الرئيسية على الموبايل/التابلت، وعمود جنبها (يمين) على الشاشات الكبيرة */}
          {images.length > 1 && (
            <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto scrollbar-hide lg:w-16 lg:max-h-[520px] lg:flex-shrink-0">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    index === activeImageIndex ? "border-black" : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: "#F5F5F5" }}
                  aria-label={t('product.imageAlt', { index: index + 1 })}
                >
                  <Image
                    src={typeof img === "string" ? img : "/pl1.jpg"}
                    alt={`${tApi(product.name, lang)} ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* الصورة الرئيسية */}
          <div className="relative order-1 lg:order-2 w-full lg:flex-1 rounded-2xl overflow-hidden aspect-square" style={{ backgroundColor: "#F5F5F5" }}>
            <div
              className="relative w-full h-full overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setIsImageZooming(true)}
              onMouseLeave={() => setIsImageZooming(false)}
              onMouseMove={handleImageMouseMove}
              onClick={openLightbox}
            >
              <Image
                src={typeof images[activeImageIndex] === "string" ? images[activeImageIndex] : "/pl1.jpg"}
                alt=""
                aria-hidden="true"
                fill
                className="object-cover scale-125 blur-lg opacity-25"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <Image
                src={typeof images[activeImageIndex] === "string" ? images[activeImageIndex] : "/pl1.jpg"}
                alt={`${tApi(product.name, lang)} ${activeImageIndex + 1}`}
                fill
                className="object-contain scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={activeImageIndex === 0}
              />
              {isImageZooming && (
                <div
                  className="absolute inset-0 z-20 hidden lg:block pointer-events-none"
                  style={{
                    backgroundImage: `url(${typeof images[activeImageIndex] === "string" ? images[activeImageIndex] : "/pl1.jpg"})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "200%",
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              )}
              <span className="absolute bottom-2 end-2 sm:bottom-3 sm:end-3 bg-black/50 text-white rounded-full p-1.5 sm:p-2 pointer-events-none z-10">
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Lightbox: fullscreen viewer with double-tap/double-click zoom + drag-to-pan — works on mobile, tablet, and desktop ═══ */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[1200] bg-black/95 flex items-center justify-center touch-none"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 end-4 sm:top-6 sm:end-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-6 h-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
                    setLightboxScale(1);
                    setLightboxOffset({ x: 0, y: 0 });
                  }}
                  className="absolute top-1/2 -translate-y-1/2 start-2 sm:start-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={t('product.previousImage')}
                >
                  {dir === 'rtl' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((i) => (i + 1) % images.length);
                    setLightboxScale(1);
                    setLightboxOffset({ x: 0, y: 0 });
                  }}
                  className="absolute top-1/2 -translate-y-1/2 end-2 sm:end-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={t('product.nextImage')}
                >
                  {dir === 'rtl' ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </>
            )}

            <div
              className="relative w-full h-full max-w-4xl max-h-[85vh] m-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={handleLightboxPointerDown}
              onPointerMove={handleLightboxPointerMove}
              onPointerUp={endLightboxDrag}
              onPointerLeave={endLightboxDrag}
              style={{ cursor: lightboxScale > 1 ? "grab" : "zoom-in", touchAction: "none" }}
            >
              <div
                className="relative w-full h-full transition-transform"
                style={{
                  transform: `translate(${lightboxOffset.x}px, ${lightboxOffset.y}px) scale(${lightboxScale})`,
                  transitionDuration: lightboxDragRef.current ? "0ms" : "200ms",
                }}
              >
                <Image
                  src={typeof images[activeImageIndex] === "string" ? images[activeImageIndex] : "/pl1.jpg"}
                  alt={`${tApi(product.name, lang)} ${activeImageIndex + 1}`}
                  fill
                  className="object-contain pointer-events-none"
                  sizes="100vw"
                />
              </div>
            </div>

            <p className="absolute bottom-4 sm:bottom-6 inset-x-0 text-center text-white/60 text-xs">
              {t('product.doubleTapToZoom')}
            </p>
          </div>
        )}

        {/* ═══ Column 2: Product Details ═══ */}
        <div className="flex flex-col">
          {/* Brand — desktop only, shown above the image on mobile */}
          {product?.brand?.id ? (
            <Link
              href={`/brand/${product.brand.id}?name=${encodeURIComponent(tApi(product.brand.name ?? product.brand, lang))}`}
              className="hidden lg:inline-block text-sm font-semibold text-primary hover:underline mb-1 self-start"
            >
              {tApi(product.brand.name ?? product.brand, lang)}
            </Link>
          ) : product?.brand ? (
            <span className="hidden lg:block text-sm font-semibold text-primary mb-1">
              {tApi(typeof product.brand === "object" ? product.brand.name : product.brand, lang)}
            </span>
          ) : null}

          {/* Title — desktop only, shown above the image on mobile */}
          <h1 className="hidden lg:block text-xl md:text-2xl font-bold leading-tight" style={{ color: "#212121" }}>
            {tApi(product.name, lang)}
          </h1>

          {/* Rating — desktop only, shown above the image on mobile */}
          <div className="hidden lg:flex items-center gap-2 mt-2">
            <StarRating value={avgRating} />
            <span style={{ fontSize: 14, color: "#666" }}>
              {avgRating > 0 ? `${avgRating.toFixed(1)} · ` : ""}
              {(reviewCount ?? 0).toLocaleString("en-US")} {t('product.reviewsCount')}
            </span>
          </div>

          {/* Price */}
          <div className={`text-3xl font-bold mt-4 ${discountPct > 0 ? "text-red-600" : "text-black"}`}>
            {(currentPrice ?? 0).toLocaleString("en-US")} {t('common.egp')}
          </div>

          {/* Original Price + Discount */}
          {originalPrice > currentPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg text-gray-400 line-through">
                {(originalPrice ?? 0).toLocaleString("en-US")} {t('common.egp')}
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
                {t('product.inStock')}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {t('product.outOfStock')}
              </div>
            )}
          </div>

          {/* Vendor */}
          {product?.vendor?.store_name && (
            <p className="text-sm mt-3" style={{ color: "#666" }}>
              {t('product.store')}:{" "}
              <Link
                href={`/vendor/${product.vendor.id}`}
                className="font-medium hover:text-primary transition-colors"
                style={{ color: "#212121" }}
              >
                {tApi(product.vendor.store_name, lang)}
              </Link>
            </p>
          )}

          {/* ── Color Selection ── */}
          {product.groups && product.groups.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2" style={{ color: "#212121" }}>
                {t('product.chooseColor')}
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
                        <span key={k}>{tApi(v, lang)}</span>
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
                    <span className="text-gray-500">{t('product.availableQty')}: </span>
                    <span className={`font-semibold ${maxStock <= 3 ? 'text-red-600' : 'text-amber-500'}`}>
                      {maxStock} {t('product.pieces')}
                    </span>
                    {maxStock <= 3 && (
                      <span className="text-red-600 text-xs block font-medium">{t('product.lastPieces')}</span>
                    )}
                  </div>
                )}
                {maxOrderQty !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t('product.maxOrderQty')}: <span className="font-semibold text-gray-600">{maxOrderQty} {t('product.pieces')}</span>
                  </p>
                )}
              </div>
            </>
          )}
          {!inStock && (
            <div className="mt-4 px-4 py-3 bg-gray-100 rounded-xl text-center">
              <p className="text-base font-semibold text-gray-500">{t('product.outOfStockInInventory')}</p>
            </div>
          )}

          {/* ── Action Buttons ── */}
          {/* Buy Now */}
          <button
            onClick={async () => {
              if (!authState.isAuthenticated) { toast.info(t('product.loginFirst')); return; }
              try {
                setAddingToCart(true);
                await addToCart(product!.id, quantity, selectedItem?.id || null);
                router.push('/checkout');
              } catch (error: any) {
                toast.error(error.response?.data?.message || t('product.errorAdding'));
                setAddingToCart(false);
              }
            }}
            disabled={addingToCart || !inStock}
            className="w-full h-12 bg-black text-white text-base font-semibold rounded-xl hover:bg-gray-900 transition-colors mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? t('product.adding') : t('product.buyNow')}
          </button>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !inStock}
            className="w-full h-12 bg-white text-black text-base font-semibold rounded-xl border-2 border-black hover:bg-gray-50 transition-colors mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            {t('product.addToCart')}
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
            {wishlisted ? t('product.inWishlist') : t('product.addToWishlist')}
          </button>

          {/* ── Feature Values ── */}
          {Array.isArray(product.feature_values) && product.feature_values.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-6 border-t border-gray-100">
              {product.feature_values.map((f: any) => (
                <div
                  key={f.id}
                  className="flex flex-col items-center text-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-xl bg-gray-50"
                >
                  {f.logo_url ? (
                    <img src={f.logo_url} alt={f.title} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                  ) : (
                    <span className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-800">{f.title}</span>
                  {f.value && <span className="text-[10px] sm:text-xs text-gray-500">{f.value}</span>}
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
        </div>
      </div>

      {/* ── Video: full width, below image + buy box ── */}
          {product.video && (
            <div className="mt-8">
              <h3 className="text-base font-bold mb-3">{t('product.productVideo')}</h3>
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

          {/* ── Accordions: 2 columns on wide screens ── */}
          <div className="mt-6 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:divide-x rtl:lg:divide-x-reverse lg:divide-gray-100">
            {/* Column A: Specs + Description */}
            <div>
              {Array.isArray(product.attributes) && product.attributes.length > 0 && (
                <Accordion title={t('product.specifications')}>
                  <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
                    {product.attributes.map((attr: { name: string; value: string }, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center text-sm ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <span className="w-1/2 px-4 py-2.5 font-medium text-gray-700 border-e border-gray-200">
                          {attr.name}
                        </span>
                        <span className="w-1/2 px-4 py-2.5 text-gray-600">
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {product.long_description && (
                <Accordion title={t('product.description')} defaultOpen>
                  <div
                    className="leading-relaxed prose prose-sm max-w-none text-gray-700 [&_p]:mb-3 [&_br]:block [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5"
                    dangerouslySetInnerHTML={{ __html: tLang(product.long_description, lang) }}
                  />
                </Accordion>
              )}
            </div>

            {/* Column B: Reviews + FAQ */}
            <div className="lg:ps-8">
            <Accordion title={`${t('product.reviews')} ${reviewCount > 0 ? `(${reviewCount})` : ""}`} defaultOpen={reviewCount > 0}>
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
                    <span className="text-xs text-gray-400">{reviewCount} {t('product.reviewsCount')}</span>
                  </div>
                  {/* Bars */}
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(n => {
                      const count = reviewsList.filter((r: any) => Math.round(r.rating) === n).length;
                      const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4 text-end">{n}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-end">{count}</span>
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
                  <p className="text-sm">{t('product.noReviewsYet')}</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviewsList.map((r: any) => (
                    <div key={r.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {(r.user_name || r.user || r.name || t('product.anonymousInitial')).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{r.user_name || r.user || r.name || t('product.anonymousUser')}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`w-3 h-3 ${n <= Math.round(r.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.created_at && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(r.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {(r.comment || r.review) && <p className="text-sm text-gray-600 leading-relaxed ps-12">{r.comment || r.review}</p>}
                      {(r.image_url || r.image) && (
                        <div className="mt-3 ps-12">
                          <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-gray-100">
                            <Image src={r.image_url || r.image} alt={t('product.reviewImageAlt')} fill className="object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              <div className="border-t border-gray-100 pt-5 mt-2">
                <h4 className="text-sm font-bold text-gray-800 mb-4">{t('product.addYourReview')}</h4>
                {authState.isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Stars */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">{t('product.yourRating')}</label>
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
                      placeholder={t('product.reviewPlaceholder')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 transition-colors"
                      rows={3}
                    />
                    {/* Image Upload */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">{t('product.attachImageOptional')}</label>
                      <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                        <PlusIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{reviewImage ? reviewImage.name : t('product.chooseImage')}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setReviewImage(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="h-11 px-8 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting ? t('product.submitting') : t('product.submitReview')}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      <Link href="/login" className="font-semibold text-gray-900 hover:underline">{t('header.login')}</Link>{" "}
                      {t('product.loginToReviewSuffix')}
                    </p>
                  </div>
                )}
              </div>
            </Accordion>

            {/* FAQ */}
            {faqs.length > 0 && (
              <Accordion title={t('product.faq')}>
                <div className="space-y-3">
                  {faqs.map((faq: any, idx: number) => (
                    <div key={faq.id ?? idx}>
                      <p className="font-semibold text-gray-800 mb-1" dangerouslySetInnerHTML={{ __html: tApi(faq.question, lang) }} />
                      <div className="text-gray-600 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tApi(faq.answer, lang) }} />
                    </div>
                  ))}
                </div>
              </Accordion>
            )}
            </div>
          </div>

      {/* Frequently Bought Together Section - Larger Cards */}
      {complementaryProducts.length > 0 && (
        <div className="mt-8 p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <h3 className="text-base font-bold mb-6 text-gray-900">{t('product.alsoSoldWith')}</h3>

          <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Main Product */}
            <div className="flex-shrink-0 w-32 flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 bg-white rounded-xl overflow-hidden group">
                <input
                  type="checkbox"
                  checked={selectedBoughtTogether.includes(String(product.id))}
                  onChange={() => toggleBoughtTogether(String(product.id))}
                  className="absolute top-2 end-2 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                />
                <div className="relative w-full h-full p-2">
                  <Image src={images[0]} alt={tApi(product.name, lang)} fill className="object-contain" sizes="128px" />
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2 mb-1 h-7">{tApi(product.name, lang)}</p>
                <p className={`text-xs font-black ${discountPct > 0 ? "text-red-600" : "text-gray-900"}`}>{formatCurrency(currentPrice)}</p>
              </div>
            </div>

            {complementaryProducts.slice(0, 3).map((prod) => (
              <div key={prod.id} className="flex items-start gap-3">
                <div className="flex items-center justify-center h-32 text-gray-300">
                  <PlusIcon className="w-4 h-4" />
                </div>
                <div className="flex-shrink-0 w-32 flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 bg-white rounded-xl overflow-hidden group">
                    <input
                      type="checkbox"
                      checked={selectedBoughtTogether.includes(String(prod.id))}
                      onChange={() => toggleBoughtTogether(String(prod.id))}
                      className="absolute top-2 end-2 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                    />
                    <div className="relative w-full h-full p-2">
                      <Image src={prod.image} alt={tApi(prod.name, lang)} fill className="object-contain" sizes="128px" />
                    </div>
                  </div>
                  <div className="text-center w-full">
                    <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2 mb-1 h-7">{tApi(prod.name, lang)}</p>
                    <p className={`text-xs font-black ${(prod.discount ?? 0) > 0 ? "text-red-600" : "text-gray-900"}`}>{formatCurrency(prod.price)}</p>
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
              {t('product.buyTogether', { count: selectedBoughtTogether.length, price: formatCurrency(calculateTotalBoughtTogether()) })}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Complementary Products ═══ */}
      {complementaryProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('product.buyTogetherSaveTitle')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide">
            {complementaryProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.id}/${generateSlug(tApi(prod.name, lang))}`}
                className="shrink-0 w-44 md:w-auto bg-transparent rounded-xl p-3 transition-shadow"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white mb-2 p-2">
                  <Image
                    src={prod.image || "/pl1.jpg"}
                    alt={tApi(prod.name, lang)}
                    fill
                    className="object-contain"
                    sizes="176px"
                  />
                </div>
                <p className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "#212121" }}>
                  {tApi(prod.name, lang)}
                </p>
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(prod.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ms-1">({prod.reviewsCount || 0})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${(prod.discount ?? 0) > 0 ? "text-red-600" : "text-black"}`}>
                    {formatCurrency(prod.price || 0)}
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

      {/* ═══ Similar Products ═══ */}
      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('product.similarProducts')}</h2>
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
    </div>
  );
}
