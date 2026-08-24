import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import "./globals.css";
import { Tajawal } from "next/font/google";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppToastContainer from "@/components/AppToastContainer";
import { API_BASE_URL } from "@/lib/api";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tix-eg.com"),
  verification: {
    google: '8amSq9TaQsJ0PbXU4C6IjkY-jrcCgleav',
  },
  title: {
    default: "تيكس TIX | أفضل منصة تسوق أونلاين في مصر - ملابس ومستحضرات تجميل",
    template: "%s | تيكس TIX",
  },
  description:
    "تيكس (TIX) أفضل منصة تسوق إلكتروني في مصر. أفضل منصة لبيع الملابس والهدوم، ومستحضرات التجميل والكوزمتكس، والإلكترونيات والأجهزة المنزلية والعناية الشخصية. أسعار منافسة، دفع عند الاستلام، توصيل سريع خلال 1-3 أيام لجميع محافظات مصر، واستبدال وإرجاع خلال 14 يوم.",
  keywords: [
    // أسماء المنصة بكل الصيغ
    "تيكس", "تكس", "TIX", "Tix", "tix", "منصة تيكس", "موقع تيكس", "TIX Egypt", "تيكس مصر",
    // عبارات النية الشرائية
    "أفضل منصة لبيع الملابس", "أفضل منصة لبيع الهدوم", "أفضل موقع لبيع الملابس في مصر",
    "أفضل منصة لبيع مستحضرات التجميل", "أفضل منصة لبيع الكوزمتكس", "أفضل موقع مكياج في مصر",
    "أفضل منصة لبيع الإلكترونيات", "أفضل موقع تسوق أونلاين في مصر",
    // عام
    "تسوق اون لاين", "تسوق أونلاين مصر", "منتجات مصر", "شحن سريع مصر", "دفع عند الاستلام",
  ],
  alternates: {
    canonical: "https://tix-eg.com",
  },
  openGraph: {
    title: "تيكس TIX | أفضل منصة تسوق أونلاين في مصر",
    description:
      "أفضل منصة لبيع الملابس ومستحضرات التجميل والإلكترونيات في مصر — أسعار منافسة وتوصيل سريع ودفع عند الاستلام.",
    url: "https://tix-eg.com",
    siteName: "تيكس TIX",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تيكس TIX | أفضل منصة تسوق أونلاين في مصر",
    description: "أفضل منصة لبيع الملابس ومستحضرات التجميل والإلكترونيات في مصر",
  },
  icons: {
    icon: "/logo.svg",
  },
};

// ── Google Analytics (GA4) ──
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-2CSGFKLBVN";

// ── Microsoft Clarity (تسجيل جلسات + خرائط حرارية) ──
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "xpwgrpe837";

// ── بيانات منظّمة (JSON-LD) — يقرأها جوجل والـ AI ولا تظهر للعميل ──
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": "https://tix-eg.com/#store",
      name: "تيكس",
      alternateName: ["TIX", "Tix", "tix", "تكس", "منصة تيكس", "TIX Egypt", "تيكس مصر"],
      url: "https://tix-eg.com",
      logo: "https://tix-eg.com/logo.svg",
      image: "https://tix-eg.com/logo.svg",
      description:
        "تيكس (TIX) أفضل منصة تسوق إلكتروني في مصر لبيع الملابس والهدوم ومستحضرات التجميل والكوزمتكس والإلكترونيات والأجهزة المنزلية، بأسعار منافسة، توصيل سريع خلال 1-3 أيام، ودفع عند الاستلام، مع إمكانية الاستبدال والإرجاع خلال 14 يوم.",
      slogan: "أفضل منصة تسوق أونلاين في مصر",
      areaServed: { "@type": "Country", name: "Egypt", alternateName: "مصر" },
      currenciesAccepted: "EGP",
      paymentAccepted: "نقدي عند الاستلام، فيزا، محفظة إلكترونية",
      // سياسة الاستبدال والإرجاع — 14 يوم
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "EG",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
      // مدة التوصيل — من يوم إلى 3 أيام لكل محافظات مصر
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "EG" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
      knowsAbout: [
        "بيع الملابس والهدوم أونلاين",
        "بيع مستحضرات التجميل والكوزمتكس",
        "بيع الإلكترونيات والأجهزة المنزلية",
        "منتجات العناية الشخصية",
        "منتجات الأطفال والرضع",
        "الأحذية والحقائب",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://tix-eg.com/#website",
      url: "https://tix-eg.com",
      name: "تيكس TIX",
      alternateName: ["TIX", "Tix", "تيكس"],
      inLanguage: "ar-EG",
      publisher: { "@id": "https://tix-eg.com/#store" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://tix-eg.com/products?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "ar";
  const dir = lang === "en" ? "ltr" : "rtl";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {/* تسريع الاتصال بسيرفر الـAPI والصور — بيبدأ DNS/TCP/TLS بدري بدل ما يستنى أول طلب فعلي */}
        <link rel="preconnect" href={API_BASE_URL} />
        <link rel="dns-prefetch" href={API_BASE_URL} />
        {/* بيانات منظّمة لمحركات البحث والـ AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && !GA_MEASUREMENT_ID.includes("XXXX") && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {/* Microsoft Clarity */}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}
      </head>
      <body className={`${tajawal.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <LanguageProvider initialLang={lang}>
          <GoogleAuthProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <AppToastContainer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
          </GoogleAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
