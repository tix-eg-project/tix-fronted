"use client";
import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-black hover:bg-gray-100 transition-colors ${className}`}
      aria-label={t("header.language")}
      title={t("header.language")}
    >
      <Languages className="h-4 w-4" />
      <span>{lang === "ar" ? t("header.switchToEnglish") : t("header.switchToArabic")}</span>
    </button>
  );
}
