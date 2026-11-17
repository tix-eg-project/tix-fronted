import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  return (name || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

export function formatPrice(price: number): string {
  return (price ?? 0).toLocaleString("en-US");
}

export function formatCurrency(price: number): string {
  return `${formatPrice(price)} EGP`;
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Extract text from a localized API field.
 * The API may return either a plain string or an object like {ar: "...", en: "..."}.
 * `lang` picks which key to prefer; defaults to "ar" to preserve existing behavior
 * for callers that haven't been updated to pass the active site language yet.
 */
export function t(value: any, lang: "ar" | "en" = "ar"): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (lang === "en") {
      return value.en || value.ar || Object.values(value).find((v) => typeof v === "string") || "";
    }
    return value.ar || value.en || Object.values(value).find((v) => typeof v === "string") || "";
  }
  return String(value);
}

// Extracts a valid image URL from product data regardless of API format
export function getProductImage(p: any, fallback = "/pl1.jpg"): string {
  const raw = p?.images?.[0] ?? p?.image ?? null;
  if (!raw) return fallback;
  if (typeof raw === "string") return raw || fallback;
  if (typeof raw === "object") return raw.url || raw.path || raw.src || fallback;
  return fallback;
}

/**
 * Map backend error keys/messages to clear Arabic user-facing strings.
 * Covers all auth error codes returned by the Laravel API.
 */
const AUTH_ERROR_MAP: Record<string, string> = {
  // Login / Register
  invalid_credentials:      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  user_not_found:           "المستخدم غير موجود.",
  email_not_verified:       "يرجى تأكيد البريد الإلكتروني أولاً.",
  email_not_registered:     "البريد الإلكتروني غير مسجل.",
  email_taken:              "هذا البريد مسجل من قبل.",
  account_already_verified: "تم تفعيل هذا الحساب من قبل.",
  register_success:         "تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني.",
  register_failed:          "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى.",

  // Verification codes
  verify_code_failed:   "رمز التحقق غير صحيح أو منتهي.",
  code_expired:         "انتهت صلاحية رمز التحقق.",
  code_mismatch:        "رمز التحقق غير صحيح.",
  verify_success:       "تم التحقق من البريد الإلكتروني بنجاح.",
  reset_verify_success: "تم التحقق بنجاح، يمكنك الآن إعادة تعيين كلمة المرور.",
  must_verify_code_first: "يجب التحقق من الرمز أولاً.",

  // Password reset
  reset_code_sent:            "تم إرسال رمز إعادة التعيين إلى بريدك.",
  forget_password_code_sent:  "تم إرسال رمز استعادة كلمة المرور إلى بريدك.",
  email_send_failed:          "تعذّر إرسال البريد الإلكتروني، يرجى المحاولة مرة أخرى.",
  password_reset_success:     "تم تغيير كلمة المرور بنجاح.",

  // Generic
  login_success:     "تم تسجيل الدخول بنجاح.",
  unauthenticated:   "يرجى تسجيل الدخول أولاً.",
  unauthorized:      "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
  server_error:      "حدث خطأ في الخادم، يرجى المحاولة لاحقاً.",
  too_many_requests: "محاولات كثيرة، يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.",
};

/**
 * English messages the API returns even when asked for Arabic: the backend's
 * ar/messages.php defines some keys twice and its later English entries win.
 * Matched case-insensitively as substrings of the raw message.
 */
const AUTH_ENGLISH_MESSAGES: [phrase: string, key: string][] = [
  ["invalid credentials", "invalid_credentials"],
  ["email is not verified", "email_not_verified"],
  ["verification code is incorrect", "code_mismatch"],
  ["you must verify the reset code first", "must_verify_code_first"],
  ["too many attempts", "too_many_requests"], // Laravel's throttle (429) message
  ["too many requests", "too_many_requests"],
];

export function translateAuthError(errorOrKey: unknown): string {
  if (!errorOrKey) return "حدث خطأ غير متوقع.";

  const raw = typeof errorOrKey === "string"
    ? errorOrKey
    : (errorOrKey as Error)?.message ?? String(errorOrKey);
  const lower = raw.toLowerCase();

  // 1. Direct key match (e.g. "invalid_credentials")
  if (AUTH_ERROR_MAP[raw]) return AUTH_ERROR_MAP[raw];

  // 2. Scan the map for a partial key match inside the message
  for (const [key, arabic] of Object.entries(AUTH_ERROR_MAP)) {
    if (lower.includes(key.toLowerCase())) return arabic;
  }

  // 3. Known English API messages
  for (const [phrase, key] of AUTH_ENGLISH_MESSAGES) {
    if (lower.includes(phrase)) return AUTH_ERROR_MAP[key];
  }

  // 4. If the message itself looks Arabic already, return it as-is
  if (/[؀-ۿ]/.test(raw)) return raw;

  // 5. Fallback
  return "حدث خطأ، يرجى المحاولة مرة أخرى.";
}
