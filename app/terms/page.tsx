"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get("/terms-policy");
        const data = res.data?.data || res.data;
        if (data?.content) setContent(data.content);
      } catch {} finally { setLoading(false); }
    }
    fetch();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="section-title mb-6">{t('legal.termsTitle')}</h1>
      <div className="card p-6 md:p-8 prose prose-sm max-w-none text-text-muted leading-relaxed">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-4 rounded" style={{width: `${90-i*10}%`}} />)}
          </div>
        ) : content ? (
          <div dir="rtl" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div dir="rtl" className="space-y-4">
            <p>مرحباً بك في منصة TIX للتجارة الإلكترونية. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
            <h3 className="text-text font-bold">1. الاستخدام العام</h3>
            <p>يجب أن تكون 18 عاماً على الأقل لاستخدام هذا الموقع.</p>
            <h3 className="text-text font-bold">2. الطلبات والمدفوعات</h3>
            <p>جميع الأسعار المعروضة بالجنيه المصري (EGP) وتشمل الضرائب المطبقة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
