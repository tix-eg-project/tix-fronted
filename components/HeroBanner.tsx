 "use client";
 import { useState, useEffect } from "react";
 import Link from "next/link";
+import Image from "next/image";
+import api from "@/lib/api";
 import type { Banner } from "@/utils/Types/common";

-const defaultBanners: Banner[] = [
-  {
-    id: 1,
-    image: "",
-    title: "وفر وقتك",
-    subtitle: "واطلب مستلزماتك اونلاين",
-    cta: "تسوق الآن",
-    link: "/offers",
-  },
-];
-
-export default function HeroBanner({ banners = defaultBanners }: { banners?: Banner[] }) {
+export default function HeroBanner() {
   const [currentSlide, setCurrentSlide] = useState(0);
+  const [banners, setBanners] = useState<Banner[]>([]);
+  const [loading, setLoading] = useState(true);

+  // Fallback banners in case API fails
+  const fallbackBanners: Banner[] = [
+    {
+      id: 1,
+      image: "",
+      title: "وفر وقتك",
+      subtitle: "واطلب مستلزماتك اونلاين",
+    },
+  ];

+  useEffect(() => {
+    let cancelled = false;
+    async function fetchBanners() {
+      try {
+        const res = await api.get("/banners");
+        const data = res.data?.data || res.data;
+        if (!cancelled && Array.isArray(data) && data.length > 0) {
+          setBanners(data);
+        } else {
+          setBanners(fallbackBanners);
+        }
+      } catch {
+        if (!cancelled) setBanners(fallbackBanners);
+      } finally {
+        if (!cancelled) setLoading(false);
+      }
+    }
+    fetchBanners();
+    return () => { cancelled = true; };
+  }, []);

+  const activeBanners = banners.length > 0 ? banners : fallbackBanners;

   useEffect(() => {
-    if (banners.length <= 1) return;
+    if (activeBanners.length <= 1) return;
     const timer = setInterval(() => {
-      setCurrentSlide((prev) => (prev + 1) % banners.length);
+      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
     }, 5000);
     return () => clearInterval(timer);
-  }, [banners.length]);
+  }, [activeBanners.length]);

+  if (loading) {
+    return (
+      <section className="container mx-auto px-4 py-8">
+        <div className="h-[400px] rounded-2xl bg-gray-200 animate-pulse" />
+      </section>
+    );
+  }

   return (
     <section className="container mx-auto px-4 py-8">
       <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 h-[400px]">
-        {banners.map((banner, index) => (
+        {activeBanners.map((banner, index) => (
           <div
             key={banner.id}
             className={`absolute inset-0 transition-all duration-700 flex items-center justify-center ${
               index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
             }`}
           >
+            {/* Banner image background */}
+            {banner.image && (
+              <Image
+                src={banner.image}
+                alt={banner.title || ""}
+                fill
+                className="object-cover"
+                priority={index === 0}
+              />
+            )}
             <div className="text-center text-white z-10 px-4">
               <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
                 {banner.title}
               </h1>
               <p className="text-xl sm:text-2xl text-balance mb-8">
-                {banner.subtitle}
+                {banner.description || banner.subtitle}
               </p>
-              {banner.cta && (
-                <Link
-                  href={banner.link || "/"}
-                  className="inline-block bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-all active:scale-[0.97]"
-                >
-                  {banner.cta}
-                </Link>
-              )}
+              <Link
+                href="/offers"
+                className="inline-block bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-all active:scale-[0.97]"
+              >
+                تسوق الآن
+              </Link>
             </div>
           </div>
         ))}

         {/* Dots */}
-        {banners.length > 1 && (
+        {activeBanners.length > 1 && (
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
-            {banners.map((_, index) => (
+            {activeBanners.map((_, index) => (
               <button
                 key={index}
                 onClick={() => setCurrentSlide(index)}
                 className={`h-2 rounded-full transition-all ${
                   index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                 }`}
                 aria-label={`Go to slide ${index + 1}`}
               />
             ))}
           </div>
         )}
       </div>
     </section>
   );
 }
