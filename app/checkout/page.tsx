"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Home,
  Briefcase,
  Star,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/helpers";
import type { ShippingCity, PaymentMethod, CartSummary } from "@/utils/Types/common";

interface SavedAddress {
  id: number;
  label: string;
  name: string;
  phone: string;
  city_id?: number | null;
  city_name?: string | null;
  address: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { refreshCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ address: "", phone: "", order_note: "" });

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // City dropdown
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<ShippingCity | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const cityRef = useRef<HTMLDivElement>(null);

  // Summary & payment methods
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Auth redirect
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      window.location.href = "/login?redirect=/checkout";
    }
  }, [authState.isLoading, authState.isAuthenticated]);

  // Fetch initial data
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [summaryRes, pmRes, citiesRes, addressesRes, contactRes] = await Promise.all([
          api.get("/summary"),
          api.get("/payment-methods"),
          api.get("/shipping/cities"),
          api.get("/addresses").catch(() => null),
          api.get("/contact").catch(() => null),
        ]);

        if (summaryRes.data.status) setSummary(summaryRes.data.data);

        if (pmRes.data.status && Array.isArray(pmRes.data.data)) {
          setPaymentMethods(pmRes.data.data);
          if (pmRes.data.data.length > 0) setPaymentMethod(pmRes.data.data[0].id);
        }

        const citiesList: ShippingCity[] = citiesRes.data?.status
          ? (Array.isArray(citiesRes.data.data) ? citiesRes.data.data : [])
          : [];
        setCities(citiesList);

        const addrs: SavedAddress[] = Array.isArray(addressesRes?.data?.data)
          ? addressesRes.data.data
          : [];
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          const def = addrs.find((a) => a.is_default) || addrs[0];
          applyAddress(def, citiesList);
        } else {
          // fallback to saved contact
          setShowNewForm(true);
          if (contactRes?.data?.status && contactRes.data.data) {
            const saved = contactRes.data.data;
            setFormData((prev) => ({
              address: saved.address || prev.address,
              phone: saved.phone || prev.phone,
              order_note: saved.order_note || prev.order_note,
            }));
          }
        }
      } catch {
        toast.error("خطأ في تحميل البيانات");
      }
    };
    fetchData();
  }, [authState.isAuthenticated]);

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function applyAddress(addr: SavedAddress, citiesList?: ShippingCity[]) {
    setSelectedAddressId(addr.id);
    setShowNewForm(false);
    setFormData((prev) => ({
      ...prev,
      address: addr.address,
      phone: addr.phone,
    }));
    const list = citiesList || cities;
    if (addr.city_id && list.length > 0) {
      const city = list.find((c) => Number(c.id) === Number(addr.city_id));
      if (city) {
        setSelectedCity(city);
        updateSummaryCity(Number(city.id));
      }
    }
  }

  function handleSelectAddress(addr: SavedAddress) {
    applyAddress(addr);
  }

  function handleShowNewForm() {
    setSelectedAddressId(null);
    setShowNewForm(true);
    setFormData({ address: "", phone: "", order_note: "" });
    setSelectedCity(null);
  }

  const updateSummaryCity = async (cityId: number) => {
    try {
      const fd = new FormData();
      fd.append("vsoft_city_id", String(cityId));
      const res = await api.post("/summary", fd);
      if (res.data.status) setSummary(res.data.data);
    } catch {}
  };

  const handleCitySelect = async (city: ShippingCity) => {
    setSelectedCity(city);
    setCityOpen(false);
    setCitySearch("");
    updateSummaryCity(Number(city.id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedCity) { toast.error("اختر المدينة"); return; }

    setIsSubmitting(true);
    try {
      await api.post("/contact", {
        address: formData.address,
        phone: formData.phone,
        order_note: formData.order_note,
      });

      const fd = new FormData();
      fd.append("payment_method_id", String(paymentMethod));
      if (selectedAddressId) fd.append("address_id", String(selectedAddressId));
      const checkoutRes = await api.post("/checkout", fd);

      if (checkoutRes.data.status) {
        const { redirect_url } = checkoutRes.data.data || {};
        await refreshCart();
        if (redirect_url && redirect_url.trim()) {
          window.location.href = redirect_url;
        } else {
          toast.success("تم الطلب بنجاح!");
          setTimeout(() => router.push("/account/orders"), 1500);
        }
      } else {
        toast.error(checkoutRes.data.message || "خطأ في إتمام الطلب");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ في إتمام الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const canSubmit = selectedCity && paymentMethod && formData.address.trim() && formData.phone.trim();

  if (authState.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-xl md:text-2xl font-bold mb-6">إتمام الشراء</h1>

      {/* Steps */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: "السلة", done: true },
          { icon: MapPin, label: "الشحن", done: true },
          { icon: CreditCard, label: "الدفع", done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              step.done ? "bg-success/10 text-success" : "bg-surface-2 text-text-muted"
            }`}>
              {step.done ? <CheckCircle className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping */}
            <div className="card p-5">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                معلومات الشحن
              </h3>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-medium text-text-muted mb-2">العناوين المحفوظة</p>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={`w-full text-right p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                            isSelected
                              ? "border-primary bg-primary-light/40"
                              : "border-border hover:border-text-faint"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "bg-primary text-white" : "bg-surface-2 text-text-muted"
                          }`}>
                            {addr.label === "العمل" ? <Briefcase className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-sm font-semibold">{addr.label}</span>
                              {addr.is_default && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  <Star className="w-2.5 h-2.5 fill-primary" />
                                  افتراضي
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted">
                              {addr.address}
                              {addr.city_name && ` — ${addr.city_name}`}
                            </p>
                            <p className="text-xs text-text-faint mt-0.5">{addr.name} · {addr.phone}</p>
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add new address */}
                  <button
                    type="button"
                    onClick={handleShowNewForm}
                    className={`w-full mt-2 p-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      showNewForm
                        ? "border-primary text-primary bg-primary-light/30"
                        : "border-border text-text-muted hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة عنوان جديد
                  </button>

                </div>
              )}

              {/* City Dropdown — always shown */}
              <div className="mb-4" ref={cityRef}>
                <label className="text-sm font-medium mb-1.5 block">المدينة *</label>
                <button
                  type="button"
                  className="input-field flex items-center justify-between !py-3"
                  onClick={() => setCityOpen(!cityOpen)}
                >
                  <span className={selectedCity ? "text-text" : "text-text-faint"}>
                    {selectedCity ? selectedCity.name : "اختر المدينة"}
                  </span>
                  {cityOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {cityOpen && (
                  <div className="mt-1 bg-surface border border-border rounded-xl shadow-card-hover max-h-52 overflow-hidden z-20 relative">
                    <div className="p-2 border-b border-divider">
                      <div className="relative">
                        <input
                          type="text"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="ابحث عن المدينة..."
                          className="input-field !py-2 pr-3 pl-8 text-sm"
                          autoFocus
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          className={`w-full text-right px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors flex justify-between ${
                            selectedCity?.id === city.id ? "bg-primary-light text-primary" : ""
                          }`}
                          onClick={() => handleCitySelect(city)}
                        >
                          <span>{city.name}</span>
                          <span className="text-text-muted">{formatCurrency(city.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Address & phone — editable in all cases */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  العنوان *
                  {selectedAddressId && (
                    <span className="text-xs text-text-muted font-normal">(يمكنك التعديل)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="العنوان بالتفصيل"
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">رقم الهاتف *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="رقم الهاتف (أرقام فقط)"
                  className="input-field"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">ملاحظات (اختياري)</label>
                <textarea
                  name="order_note"
                  value={formData.order_note}
                  onChange={handleInputChange}
                  placeholder="أي ملاحظات خاصة بالطلب..."
                  className="input-field !py-2"
                  rows={3}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                طريقة الدفع
              </h3>
              <div className="space-y-2.5">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary-light"
                        : "border-border hover:border-text-faint"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium">{method.name}</p>
                      {method.description && (
                        <p className="text-xs text-text-muted mt-0.5">{method.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full !py-4 text-base"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              ملخص الطلب
            </h3>

            {summary && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">المجموع الفرعي</span>
                  <span>{formatCurrency(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">الشحن</span>
                  <span>{summary.shipping_zone ? formatCurrency(summary.shipping_zone.price) : "—"}</span>
                </div>
                {summary.shipping_zone?.name && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">المنطقة</span>
                    <span>{summary.shipping_zone.name}</span>
                  </div>
                )}
                {summary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">الخصم</span>
                    <span className="text-success">-{formatCurrency(summary.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-3 border-t border-divider">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatCurrency(summary.total)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-text-muted text-xs mt-4 p-3 bg-surface-2 rounded-xl">
              <Truck className="w-4 h-4 text-primary flex-shrink-0" />
              <span>التوصيل خلال 2-3 أيام عمل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
