"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Mail, Phone, User, Lock, Eye, EyeOff, MapPin, FileText } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function VendorRegisterPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    address: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast.error(t("vendorRegister.passwordsMismatch"));
      return;
    }
    if (formData.password.length < 6) {
      toast.error(t("vendorRegister.passwordMinLength"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/vendor/register", formData);
      if (res.data.status || res.data.success) {
        toast.success(res.data.message || t("vendorRegister.successMessage"));
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(res.data.message || t("vendorRegister.genericError"));
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] as string : String(firstError));
      } else {
        toast.error(error.response?.data?.message || t("vendorRegister.registerError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: t("vendorRegister.fullName"), icon: User, type: "text", placeholder: t("vendorRegister.fullNamePlaceholder"), required: true },
    { name: "email", label: t("vendorRegister.email"), icon: Mail, type: "email", placeholder: "email@example.com", required: true, dir: "ltr" },
    { name: "phone", label: t("vendorRegister.phone"), icon: Phone, type: "tel", placeholder: "01xxxxxxxxx", required: true, dir: "ltr" },
    { name: "company_name", label: t("vendorRegister.storeName"), icon: Store, type: "text", placeholder: t("vendorRegister.storeNamePlaceholder"), required: true },
    { name: "store_address", label: t("vendorRegister.storeAddress"), icon: MapPin, type: "text", placeholder: t("vendorRegister.storeAddressPlaceholder"), required: false },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("vendorRegister.pageTitle")}</h1>
          <p className="text-text-muted text-sm">{t("vendorRegister.pageSubtitle")}</p>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium mb-1.5 block">{field.label} {field.required && "*"}</label>
                <div className="relative">
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="input-field ps-4 pe-10"
                    dir={field.dir || dir}
                    required={field.required}
                  />
                  <field.icon className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
                </div>
              </div>
            ))}

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("vendorRegister.storeDescription")}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t("vendorRegister.storeDescriptionPlaceholder")}
                className="input-field !py-2"
                rows={3}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("vendorRegister.password")} *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field ps-10 pe-10"
                  dir="ltr"
                  required
                  minLength={6}
                />
                <Lock className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-text-faint"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("vendorRegister.confirmPassword")} *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field ps-4 pe-10"
                  dir="ltr"
                  required
                  minLength={6}
                />
                <Lock className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-faint" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  {t("vendorRegister.submitButton")}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            {t("vendorRegister.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("vendorRegister.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
