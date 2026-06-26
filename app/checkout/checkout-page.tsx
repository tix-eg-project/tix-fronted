"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ChevronDown,
  Search,
  MapPin,
  Plus,
  MoreHorizontal,
  Trash2,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/helpers";
import type { ShippingCity, PaymentMethod, CartSummary } from "@/utils/Types/common";
import { Button } from "@/components/ui/button";

interface SavedAddress {
  id: number;
  label: string;
  name: string;
  phone: string;
  city_id: number | null;
  city_name: string | null;
  address: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { state: cartState, refreshCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authState.user?.name || "",
    email: authState.user?.email || "",
    city: "",
    address: "",
    phone: "",
  });
  const [currentStep, setCurrentStep] = useState(1);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressMenuId, setAddressMenuId] = useState<number | null>(null);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedCity || !formData.address || !formData.phone || !formData.fullName) {
        toast.error("يرجى إكمال جميع البيانات المطلوبة");
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
        const [summaryRes, pmRes, citiesRes, addressesRes] = await Promise.all([
          api.get("/summary"),
          api.get("/payment-methods"),
          api.get("/shipping/cities"),
          api.get("/addresses").catch(() => ({ data: { data: [] } })),
        ]);

        if (summaryRes.data.status) setSummary(summaryRes.data.data);
        if (pmRes.data.status && Array.isArray(pmRes.data.data)) {
          setPaymentMethods(pmRes.data.data);
          if (pmRes.data.data.length > 0) setPaymentMethod(pmRes.data.data[0].id);
        }

        const citiesList = citiesRes.data?.status
          ? Array.isArray(citiesRes.data.data) ? citiesRes.data.data : []
          : [];
        setCities(citiesList);

        const addrs: SavedAddress[] = Array.isArray(addressesRes.data?.data) ? addressesRes.data.data : [];
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          selectAddress(defaultAddr, citiesList);
        } else {
          setShowAddForm(true);
        }
      } catch (error) {
        console.error("Error fetching checkout data:", error);
      }
    };
    fetchData();
  }, [authState.isAuthenticated]);

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => setAddressMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const selectAddress = (addr: SavedAddress, citiesList?: ShippingCity[]) => {
    setSelectedAddressId(addr.id);
    setShowAddForm(false);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city_name || "",
    }));

    const list = citiesList || cities;
    if (addr.city_id && list.length > 0) {
      const city = list.find((c) => c.id === addr.city_id);
      if (city) {
        setSelectedCity(city);
        updateSummaryWithCity(Number(city.id));
      }
    }
  };

  const updateSummaryWithCity = async (cityId: number) => {
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
    updateSummaryWithCity(Number(city.id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewAddress = async () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("يرجى ملء الاسم والهاتف والعنوان");
      return;
    }

    try {
      const res = await api.post("/addresses", {
        name: formData.fullName,
        phone: formData.phone,
        city_id: selectedCity?.id || null,
        city_name: selectedCity?.name || formData.city || null,
        address: formData.address,
        is_default: savedAddresses.length === 0,
      });

      if (res.data.status && res.data.data) {
        const newAddr: SavedAddress = res.data.data;
        setSavedAddresses((prev) => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        setShowAddForm(false);
        toast.success("تم حفظ العنوان");
      }
    } catch {
      toast.error("خطأ في حفظ العنوان");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.delete(`/addresses/${id}`);
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
        setShowAddForm(true);
      }
      toast.success("تم حذف العنوان");
    } catch {
      toast.error("خطأ في حذف العنوان");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.post(`/addresses/${id}/default`);
      setSavedAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !formData.address.trim() || !formData.phone.trim() || !formData.fullName.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save contact
      await api.post("/contact", {
        phone: formData.phone,
        address: formData.address,
      }).catch(() => {});

      // Save address if new
      if (saveAddress && showAddForm && formData.address) {
        handleSaveNewAddress().catch(() => {});
      }

      const fd = new FormData();
      fd.append("name", formData.fullName);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("vsoft_city_id", String(selectedCity.id));
      fd.append("city", formData.city || selectedCity.name);
      fd.append("shipping_address", formData.address);
      fd.append("payment_method_id", String(paymentMethod));
      const checkoutRes = await api.post("/checkout", fd);
      if (checkoutRes.data.status) {
        toast.success("تم إرسال طلبك بنجاح!");
        const orderData = checkoutRes.data.data;
        if (orderData.payment_url) {
          window.location.href = orderData.payment_url;
        } else {
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

  if (authState.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background" dir="rtl">
      <main className="flex-1">
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">الدفع والتسليم</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-2 transition-colors duration-300 ${step <= currentStep ? "bg-[#000]" : "bg-gray-300"}`}>
                        {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${step <= currentStep ? "text-black" : "text-gray-400"}`}>
                          {step === 1 && "عنوان الشحن"}
                          {step === 2 && "طريقة الدفع"}
                          {step === 3 && "مراجعة الطلب"}
                        </p>
                      </div>
                      {step < 3 && (
                        <div className={`h-1 flex-1 mr-2 ${step < currentStep ? "bg-[#000]" : "bg-gray-300"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Shipping Address */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && !showAddForm && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      <h2 className="text-xl font-bold mb-4 text-black">العناوين المحفوظة</h2>
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => selectAddress(addr)}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                selectedAddressId === addr.id ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                              }`}>
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm">{addr.label}</span>
                                  {addr.is_default && (
                                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">افتراضي</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {addr.address}
                                  {addr.city_name && `, ${addr.city_name}`}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2" dir="ltr">
                                  <span>{addr.phone}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{addr.name}</span>
                                </p>
                              </div>

                              {/* Menu */}
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddressMenuId(addressMenuId === addr.id ? null : addr.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </button>
                                {addressMenuId === addr.id && (
                                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                                    {!addr.is_default && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSetDefault(addr.id);
                                          setAddressMenuId(null);
                                        }}
                                        className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Star className="w-3.5 h-3.5" />
                                        تعيين كافتراضي
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAddress(addr.id);
                                        setAddressMenuId(null);
                                      }}
                                      className="w-full text-right px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      حذف
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add new address button */}
                      <button
                        onClick={() => {
                          setShowAddForm(true);
                          setSelectedAddressId(null);
                          setFormData((prev) => ({ ...prev, fullName: authState.user?.name || "", phone: "", address: "", city: "" }));
                          setSelectedCity(null);
                        }}
                        className="w-full mt-4 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-black text-gray-500 hover:text-black transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                      >
                        <Plus className="w-5 h-5" />
                        إضافة عنوان جديد
                      </button>

                      <Button
                        onClick={handleNextStep}
                        disabled={!selectedAddressId}
                        className="w-full bg-black text-white hover:bg-black/90 h-12 mt-4 font-semibold rounded-lg disabled:opacity-40"
                      >
                        التالي: اختر طريقة الدفع
                      </Button>
                    </div>
                  )}

                  {/* Add New Address Form */}
                  {(showAddForm || savedAddresses.length === 0) && (
                    <div className="bg-white rounded-lg border border-border p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-black">
                          {savedAddresses.length > 0 ? "إضافة عنوان جديد" : "بيانات الشحن"}
                        </h2>
                        {savedAddresses.length > 0 && (
                          <button
                            onClick={() => {
                              setShowAddForm(false);
                              const def = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
                              if (def) selectAddress(def);
                            }}
                            className="text-sm text-gray-500 hover:text-black"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-black">الاسم الكامل *</label>
                            <input
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="أدخل اسمك الكامل"
                              className="w-full h-12 px-3 border border-border rounded-lg text-sm outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-black">رقم الهاتف *</label>
                            <input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="01XXXXXXXXX"
                              className="w-full h-12 px-3 border border-border rounded-lg text-sm outline-none focus:border-black"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div ref={cityRef} className="relative">
                            <label className="block text-sm font-semibold mb-2 text-black">المحافظة *</label>
                            <button
                              type="button"
                              className="w-full h-12 flex items-center justify-between px-3 border border-border rounded-lg text-sm bg-white"
                              onClick={() => setCityOpen(!cityOpen)}
                            >
                              <span className={selectedCity ? "text-black" : "text-gray-400"}>
                                {selectedCity ? selectedCity.name : "اختر المحافظة"}
                              </span>
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            {cityOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                                <div className="p-2 border-b border-border">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="text"
                                      value={citySearch}
                                      onChange={(e) => setCitySearch(e.target.value)}
                                      placeholder="ابحث عن المحافظة..."
                                      className="w-full h-10 border border-border rounded text-sm outline-none pr-3 pl-8"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                  {filteredCities.map((city) => (
                                    <button
                                      key={city.id}
                                      type="button"
                                      className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 flex justify-between items-center ${
                                        selectedCity?.id === city.id ? "bg-gray-50 font-bold" : ""
                                      }`}
                                      onClick={() => handleCitySelect(city)}
                                    >
                                      <span>{city.name}</span>
                                      <span className="text-xs text-gray-500">{formatCurrency(city.price)}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-black">المدينة / المنطقة</label>
                            <input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="أدخل المدينة أو المنطقة"
                              className="w-full h-12 px-3 border border-border rounded-lg text-sm outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-black">العنوان بالتفصيل *</label>
                          <input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="الشارع، رقم البناء، الدور، الشقة..."
                            className="w-full h-12 px-3 border border-border rounded-lg text-sm outline-none focus:border-black"
                          />
                        </div>

                        {/* Save address checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="text-sm text-gray-600">حفظ العنوان للطلبات القادمة</span>
                        </label>
                      </div>

                      <div className="flex gap-3 mt-6">
                        {savedAddresses.length > 0 && showAddForm && (
                          <Button
                            onClick={() => handleSaveNewAddress()}
                            variant="outline"
                            className="h-12 font-semibold rounded-lg px-6"
                          >
                            حفظ العنوان
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (saveAddress && showAddForm) handleSaveNewAddress().catch(() => {});
                            handleNextStep();
                          }}
                          className="flex-1 bg-black text-white hover:bg-black/90 h-12 font-semibold rounded-lg"
                        >
                          التالي: اختر طريقة الدفع
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg border border-border p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6 text-black">طريقة الدفع</h2>
                  <div className="space-y-3 mb-6">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-black transition-colors"
                        style={{ borderColor: paymentMethod === method.id ? "black" : "" }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          className="w-4 h-4 text-black accent-black"
                          onChange={() => setPaymentMethod(method.id)}
                          checked={paymentMethod === method.id}
                        />
                        <div className="mr-4">
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handlePreviousStep} variant="outline" className="flex-1 h-12 font-semibold rounded-lg">
                      السابق
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1 bg-black text-white hover:bg-black/90 h-12 font-semibold rounded-lg">
                      التالي: مراجعة الطلب
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg border border-border p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6 text-black">مراجعة الطلب</h2>
                  <div className="space-y-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-2">عنوان الشحن</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {formData.fullName} • {formData.phone}
                        <br />
                        {formData.address}
                        {formData.city && `, ${formData.city}`}
                        {selectedCity && `, ${selectedCity.name}`}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">طريقة الدفع</h3>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handlePreviousStep} variant="outline" className="flex-1 h-12 font-semibold rounded-lg">
                      السابق
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-black text-white hover:bg-black/90 h-12 font-semibold rounded-lg"
                    >
                      {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-border p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-4">ملخص الطلب</h2>
                <div className="space-y-3 mb-4 pb-4 border-b border-border text-black">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </span>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {cartState.items.length === 0 && (
                    <p className="text-xs text-gray-400">لا توجد منتجات في السلة</p>
                  )}
                </div>
                {summary && (
                  <div className="space-y-4 text-black">
                    <div className="space-y-3 mb-4 pb-4 border-b border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span className="font-semibold">{formatCurrency(summary.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الشحن</span>
                        <span className="font-semibold">
                          {summary.shipping_zone ? formatCurrency(summary.shipping_zone.price) : "—"}
                        </span>
                      </div>
                      {summary.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">الخصم</span>
                          <span className="font-semibold text-green-600">-{formatCurrency(summary.discount)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mb-4 pb-4 border-b border-border items-center">
                      <span className="font-bold">الإجمالي</span>
                      <span className="text-2xl font-bold">{formatCurrency(summary.total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">التوصيل خلال 2-3 أيام عمل</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
