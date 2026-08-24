"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import namespaces, { type Lang } from "@/lib/i18n/dictionaries";

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

type LanguageContextType = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const [ns, ...rest] = key.split(".");
  const path = rest.join(".");
  const namespace = (namespaces as any)[ns];
  let value: string | undefined = namespace?.[lang]?.[path] ?? namespace?.ar?.[path];
  if (value == null) return key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value!.replace(`{${k}}`, String(v));
    }
  }
  return value;
}

function applyDomLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({
  children,
  initialLang = "ar",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();

  // Restore persisted preference on mount (covers cases where the cookie
  // wasn't readable server-side yet but localStorage has it, e.g. first client render)
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("tix_lang") as Lang | null) : null;
    if (stored && stored !== lang && (stored === "ar" || stored === "en")) {
      setLangState(stored);
      applyDomLang(stored);
    } else {
      applyDomLang(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      applyDomLang(next);
      if (typeof window !== "undefined") localStorage.setItem("tix_lang", next);
      setCookie("lang", next, COOKIE_OPTIONS);
      // Re-render Server Components (e.g. the home page, about/contact, product
      // metadata) with the new `lang` cookie — without this they'd keep showing
      // whatever language was active on the last full page load.
      router.refresh();
    },
    [router],
  );

  const toggleLang = useCallback(() => {
    setLang(lang === "ar" ? "en" : "ar");
  }, [lang, setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
