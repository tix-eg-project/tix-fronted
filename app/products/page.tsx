"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ChevronDown,
  Grid3X3,
  List,
  Filter,
  X,
  Search,
  RotateCcw
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, formatCurrency } from "@/utils/helpers";
import type { ProductCardProps } from "@/utils/Types/products";

const Checkbox = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: () => void }) => (
  <div
    onClick={onCheckedChange}
    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${
      checked ? "bg-red-600 border-red-600" : "bg-white border-gray-300 hover:border-red-600"
    }`}
  >
    {checked && <div className="w-2 h-2 bg-white rounded-full" />}
  </div>
);

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-0"
      >
        <h4 className="font-bold text-sm">{title}</h4>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const searchParam = searchParams.get("q");

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("50000");
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync from URL
  useEffect(() => {
    setSelectedCategory(categoryParam || "");
    setSelectedSubcategory(subcategoryParam || "");
  }, [categoryParam, subcategoryParam]);

  // Fetch categories (with subcategories) once
  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.data.status) setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => {});
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    setSelectedSubcategory("");
    if (!selectedCategory) { setSubcategories([]); return; }

    // Try nested first, then dedicated endpoint
    const cat = categories.find((c: any) => String(c.id) === selectedCategory);
    if (Array.isArray(cat?.subcategories) && cat.subcategories.length > 0) {
      setSubcategories(cat.subcategories);
      return;
    }

    api.get(`/subcategories?category_id=${selectedCategory}`)
      .then((res) => {
        if (res.data.status) {
          const raw = res.data.data;
          setSubcategories(Array.isArray(raw) ? raw : raw?.data || []);
        }
      })
      .catch(() => {});
  }, [selectedCategory, categories]);

  // Fetch brands — filtered by category if one is selected
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const url = selectedCategory ? `/brands?category_id=${selectedCategory}` : "/brands";
        const res = await api.get(url);
        if (res.data.status) {
          const raw = res.data.data;
          setBrands(Array.isArray(raw) ? raw : raw?.data || []);
        }
      } catch {}
    };
    fetchBrands();
  }, [selectedCategory]);

  // Debounce price
  useEffect(() => {
    const timer = setTimeout(() => {
      const min = parseInt(minPrice);
      const max = parseInt(maxPrice);
      setPriceRange([isNaN(min) ? 0 : min, isNaN(max) ? 50000 : max]);
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "40");
        if (selectedCategory) params.set("category_id", selectedCategory);
        if (selectedSubcategory) params.set("subcategory_id", selectedSubcategory);
        if (selectedBrand) params.set("brand_id", selectedBrand);
        if (searchParam) params.set("search", searchParam);
        if (priceRange[0] > 0) params.set("min_price", String(priceRange[0]));
        if (priceRange[1] < 50000) params.set("max_price", String(priceRange[1]));
        if (sortBy === "price_low") { params.set("sort", "price"); params.set("direction", "asc"); }
        if (sortBy === "price_high") { params.set("sort", "price"); params.set("direction", "desc"); }
        if (sortBy === "rating") { params.set("sort", "rating"); params.set("direction", "desc"); }

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.status) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
          let mapped = data.map((p: any): ProductCardProps => ({
            id: String(p.id),
            name: p.name,
            price: p.price_after || p.price,
            originalPrice: p.price_before,
            image: p.images?.[0] || p.image || "/pl1.jpg",
            discount: p.discount || 0,
            rating: p.avg_rating || p.reviews?.average_rating || 0,
            reviewsCount: p.reviews?.count || 0,
          }));

          mapped = mapped.filter((p: ProductCardProps) => p.price >= priceRange[0] && p.price <= priceRange[1]);
          if (selectedRatings.length > 0) {
            mapped = mapped.filter((p: ProductCardProps) => selectedRatings.some((r) => (p.rating ?? 0) >= r));
          }
          if (sortBy === "price_low") mapped.sort((a: ProductCardProps, b: ProductCardProps) => a.price - b.price);
          else if (sortBy === "price_high") mapped.sort((a: ProductCardProps, b: ProductCardProps) => b.price - a.price);
          else if (sortBy === "rating") mapped.sort((a: ProductCardProps, b: ProductCardProps) => (b.rating || 0) - (a.rating || 0));

          setProducts(mapped);
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedBrand, sortBy, searchParam, priceRange, selectedRatings]);

  const resetFilters = () => {
    setMinPrice("0");
    setMaxPrice("50000");
    setPriceRange([0, 50000]);
    setSelectedRatings([]);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
  };

  const activeFiltersCount = [
    selectedBrand,
    priceRange[0] > 0 ? "price" : "",
    priceRange[1] < 50000 ? "price" : "",
    ...selectedRatings,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]" dir="rtl">
      <main className="flex-1 pt-16 md:pt-0">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 pt-8 pb-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-red-600">الرئيسية</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">المنتجات</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {searchParam ? `نتائج البحث عن: "${searchParam}"` : "تسوق جميع المنتجات"}
            </h1>
            <p className="text-gray-500 mt-1 mb-5">{products.length} منتج متاح</p>

            {/* Subcategory tabs */}
            {subcategories.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4">
                <Link
                  href={`/products?category=${selectedCategory}`}
                  className={`shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all ${
                    !selectedSubcategory
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                    الكل
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">الكل</span>
                </Link>

                {subcategories.map((sub: any) => {
                  const catObj = categories.find((c: any) => String(c.id) === selectedCategory);
                  const catName = catObj ? t(catObj.name) : "";
                  return (
                  <Link
                    key={sub.id}
                    href={`/subcategory/${sub.id}?name=${encodeURIComponent(t(sub.name))}&category=${selectedCategory}&categoryName=${encodeURIComponent(catName)}`}
                    className={`shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200`}
                  >
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all bg-white ${
                      selectedSubcategory === String(sub.id) ? "border-red-600" : "border-gray-200"
                    }`}>
                      {sub.image ? (
                        <img
                          src={sub.image}
                          alt={t(sub.name)}
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {t(sub.name).charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap">{t(sub.name)}</span>
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* Sidebar Filters */}
            <aside className={`lg:w-72 flex-shrink-0 ${filtersOpen ? "fixed inset-0 z-[1100] bg-white p-4 pt-24 sm:p-6 sm:pt-28 overflow-y-auto lg:static lg:bg-transparent lg:p-0" : "hidden lg:block"}`}>
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">تصفية النتائج</h3>
                  <button onClick={() => setFiltersOpen(false)} className="lg:hidden p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <FilterSection title="البراند">
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      <button
                        onClick={() => setSelectedBrand("")}
                        className={`w-full text-right px-3 py-2 text-sm rounded-lg transition-all ${!selectedBrand ? "bg-gray-100 text-black font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        الكل
                      </button>
                      {brands.map((brand: any) => (
                        <button
                          key={brand.id}
                          onClick={() => setSelectedBrand(String(brand.id))}
                          className={`w-full text-right px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${selectedBrand === String(brand.id) ? "bg-gray-100 text-black font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {brand.logo && (
                            <img src={brand.logo} alt={t(brand.name)} className="w-5 h-5 object-contain rounded" />
                          )}
                          <span>{t(brand.name)}</span>
                        </button>
                      ))}
                    </div>
                  </FilterSection>
                )}

                {/* Price Range */}
                <FilterSection title="نطاق السعر">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block mb-1">من</label>
                      <Input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-9 text-sm focus-visible:ring-black focus-visible:border-black"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block mb-1">إلى</label>
                      <Input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-9 text-sm focus-visible:ring-black focus-visible:border-black"
                      />
                    </div>
                  </div>
                </FilterSection>

                {/* Ratings */}
                <FilterSection title="التقييم">
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={selectedRatings.includes(rating)}
                          onCheckedChange={() =>
                            setSelectedRatings((prev) =>
                              prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
                            )
                          }
                        />
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">فما فوق</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Reset */}
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 h-11 rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 ml-2" />
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            </aside>

            {/* Products Main Section */}
            <div className="flex-1">
              {/* Sort & View Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 hidden sm:inline">الترتيب:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-semibold border-none bg-transparent focus:ring-0 cursor-pointer outline-none"
                  >
                    <option value="newest">الأحدث أولاً</option>
                    <option value="price_low">السعر: من الأقل</option>
                    <option value="price_high">السعر: من الأعلى</option>
                    <option value="rating">الأعلى تقييماً</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setViewType("grid")} className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-red-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-100"}`}>
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setViewType("list")} className={`p-2 rounded-lg transition-all ${viewType === "list" ? "bg-red-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-100"}`}>
                    <List className="w-5 h-5" />
                  </button>
                  <button onClick={() => setFiltersOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 relative">
                    <Filter className="w-5 h-5" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Active filter chips */}
              {selectedBrand && (() => {
                const brand = brands.find((b: any) => String(b.id) === selectedBrand);
                return brand ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                      {t(brand.name)}
                      <button onClick={() => setSelectedBrand("")}><X className="w-3 h-3" /></button>
                    </span>
                  </div>
                ) : null;
              })()}

              {/* Loading */}
              {loading ? (
                <div className={`grid ${viewType === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4`}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className={`bg-white rounded-xl border border-gray-200 p-4 animate-pulse ${viewType === "list" ? "flex gap-4" : ""}`}>
                      <div className={`${viewType === "list" ? "w-48 h-40" : "w-full aspect-[4/5] lg:aspect-square"} bg-gray-100 rounded-lg`} />
                      <div className="flex-1 mt-4">
                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className={`grid ${viewType === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-3 sm:gap-4`}>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col h-full ${viewType === "list" ? "sm:flex-row sm:items-center gap-4 sm:gap-6" : ""}`}
                    >
                      <div className={`relative overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center ${viewType === "list" ? "w-48 h-48 sm:w-60 sm:h-60" : "w-full aspect-[4/5] lg:aspect-square"}`}>
                        <Image src={product.image} alt={product.name} fill className="object-contain transition-transform duration-500" />
                        {(product.discount ?? 0) > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg z-10">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex-1 flex flex-col group-hover:bg-black/[0.02] transition-colors duration-300">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-2 h-10 overflow-hidden">{t(product.name)}</h3>
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                            {(product.originalPrice ?? 0) > product.price && (
                              <span className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice ?? 0)}</span>
                            )}
                          </div>
                          <Button className="w-full mt-3 bg-gray-900 text-white hover:bg-black rounded-lg h-9 text-xs transition-colors">
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">عذراً، لم نجد أي منتجات</h3>
                  <p className="text-gray-500 mb-8">حاول تغيير الفلاتر أو البحث عن شيء آخر</p>
                  <Button onClick={resetFilters} className="bg-red-600 text-white hover:bg-red-700">
                    إعادة تعيين كافة الفلاتر
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 animate-pulse"><div className="h-96 bg-gray-100 rounded-3xl" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
