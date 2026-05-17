"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";

type Step = "email" | "verify" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/user/send-reset-code", { email });
      if (res.data.status || res.data.success) {
        toast.success(res.data.message || "تم إرسال كود التحقق");
        setStep("verify");
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ في إرسال الكود");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await api.post("/auth/user/resend-reset-code", { email });
      toast.success("تم إعادة إرسال الكود");
    } catch {
      toast.error("حدث خطأ في إعادة الإرسال");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/user/verify-reset-code", { email, code });
      if (res.data.status || res.data.success) {
        toast.success("تم التحقق بنجاح");
        setStep("reset");
      } else {
        toast.error(res.data.message || "كود غير صحيح");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "كود غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/user/reset-password", {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (res.data.status || res.data.success) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setStep("done");
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ في تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { key: "email", label: "البريد", icon: Mail },
    { key: "verify", label: "التحقق", icon: ShieldCheck },
    { key: "reset", label: "كلمة المرور", icon: KeyRound },
  ];

  const stepIndex = step === "done" ? 3 : stepLabels.findIndex((s) => s.key === step);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TIX</h1>
          <p className="text-text-muted">إعادة تعيين كلمة المرور</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  i <= stepIndex
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-2 text-text-muted"
                }`}
              >
                {i < stepIndex ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                <span>{s.label}</span>
              </div>
              {i < 2 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="card p-6 md:p-8">
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-sm text-text-muted mb-2">أدخل بريدك الإلكتروني وسنرسل لك كود للتحقق</p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="email@example.com"
                  dir="ltr"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full !py-3.5" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال كود التحقق"}
              </button>
              <Link href="/login" className="text-sm text-primary hover:underline block text-center mt-3">
                العودة لتسجيل الدخول
              </Link>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-text-muted mb-2">
                أدخل كود التحقق المرسل إلى <strong dir="ltr">{email}</strong>
              </p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">كود التحقق</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field text-center tracking-widest text-lg"
                  placeholder="أدخل الكود"
                  dir="ltr"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full !py-3.5" disabled={loading}>
                {loading ? "جاري التحقق..." : "تحقق"}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-primary hover:underline block text-center w-full mt-2"
              >
                إعادة إرسال الكود
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-text-muted mb-2">أدخل كلمة المرور الجديدة</p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="6 أحرف على الأقل"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="input-field"
                  placeholder="أعد كتابة كلمة المرور"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary w-full !py-3.5" disabled={loading}>
                {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">تم بنجاح!</h2>
              <p className="text-text-muted mb-6">تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.</p>
              <Link href="/login" className="btn-primary inline-block !px-8 !py-3">
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
